---
title: "كيفاش تصاوب CI/CD Pipeline بـ Release Gates واضحين"
description: "دليل تقني باش تطبق pipeline ديال 'build-once, deploy-many' لواحد السيرفيس ديال تقارير الفاكتورة (billing report service) باستعمال immutable artifacts."
pubDate: 2026-10-08T21:48:00.000Z
translationKey: 239-what-is-ci-cd
seriesOrder: 54
locale: ar
tags: ["deployment-devops","learning-series"]
draft: false
---

## المبدأ الأساسي: Build Once, Deploy Many

واحد الغلط شائع فـ CI/CD هو ملي كتعاود تبني (rebuild) لابليكاسيون فكل بيئة (مثلاً كدير `mvn package` فـ staging ومن بعد كتعاودها فـ production). هادشي فيه ريسك حيت داك الـ binary اللي تيستيتي فـ staging يقدر ما يكونش هو نيت اللي غيطلع لـ production بسباب شي تغيير فـ version ديال dependencies ولا شي build flag تبدل.

الطريقة الاحترافية هي **Immutable Artifact**. الـ pipeline كيبني الكود مرة وحدة، كيديرو فـ Docker image، وكيعطيه واحد الـ digest (SHA) فريد. هاد الـ image نيتها هي اللي كدوز من staging لـ production. الفرق بين البيئات كيكون غير فـ configuration (variables d'environnement) ماشي فـ الكود.

## هندسة الـ Pipeline لسيرفيس ديال Billing Reports

فـ هاد السيناريو، السيرفيس ديال الفاكتورة خاصو يتشيكي مزيان قبل ما يطلع لـ production. هنا كنفرقو بين **Continuous Delivery** (فين الـ artifact ديما واجد، ولكن الطلعة لـ production كتبقى قرار يدوي) و **Continuous Deployment** (فين أي حاجة دازت من التيستات كطلع أوتوماتيكيا لـ production).

بالنسبة للـ billing، كنخدمو بـ Continuous Delivery باش نضمنو أن شي حد (QA lead ولا Product Owner) يشوف التقارير قبل ما يولي كلشي يشوفهم.

### كيفاش كيدوز الـ Workflow
1. **Push Event**: الديفلوبور كيدير push للكود فـ branche `main`. هادشي كيـ trigger الـ Jenkins pipeline عن طريق webhook.
2. **CI Stage**: الكود كيتكومبيلا (compile) وكيتحسبو الـ unit tests. إلا طاح شي تيست، الـ pipeline كيوقف تماك.
3. **Packaging**: كتصاوب Docker image وكتصيفطها لـ private registry. كنعطيوها tag فيه الـ Git commit hash (مثلاً `billing-service:a1b2c3d`).
4. **Staging Deployment**: الـ pipeline كيـ update البيئة ديال staging باش تخدم بـ image `a1b2c3d`. من بعد كيدوزو integration tests على هاد النسخة.
5. **Release Gate**: الـ pipeline كيوقف. كيتسنى approval يدوي من عند المسؤول.
6. **Production Deployment**: ملي كتجي الموافقة، نفس الـ image `a1b2c3d` كطلع لـ production.

## مثال تطبيقي: Plan ديال Jenkinsfile

هاد الـ `Jenkinsfile` كيكون محطوط فـ repository باش الـ pipeline يتطور مع الكود.

```groovy
pipeline {
    agent any

    environment {
        REGISTRY = "my-company-registry.io"
        IMAGE_NAME = "billing-report-service"
        IMAGE_TAG = "${env.GIT_COMMIT}"
    }

    stages {
        stage('Build & Test') {
            steps {
                // كومبيلا ودير JUnit tests
                sh './mvnw clean package'
            }
        }

        stage('Package Image') {
            steps {
                // صاوب image immuable وصيفطها للـ registry
                sh "docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ."
                sh "docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to Staging') {
            steps {
                // طلع الـ image tag لـ staging
                sh "./deploy.sh staging ${IMAGE_TAG}"
            }
        }

        stage('Integration Tests') {
            steps {
                // تيستات على الـ URL ديال staging
                sh './run-integration-tests.sh staging'
            }
        }

        stage('Production Approval') {
            steps {
                // الـ pipeline كيوقف هنا حتى يوافق شي حد
                input message: "واش نطلعو build ${IMAGE_TAG} لـ Production?", ok: "Deploy"
            }
        }

        stage('Deploy to Production') {
            steps {
                // طلع نفس الـ image tag لـ production
                sh "./deploy.sh prod ${IMAGE_TAG}"
            }
        }
    }

    post {
        failure {
            echo "الـ pipeline طاح. غنصيفطو notification لـ Slack/Email."
        }
    }
}
```

## التعامل مع Secrets و Rollbacks

Commit tag label مفيدة ولكن تقدر تتغطى. سجل registry manifest digest اللي تـpushـات وdeploy repository@sha256:… فـ staging وproduction. Jenkinsfile plan: deploy.sh خاصها resolve وتحفظ verified digest وتستعمل managed credentials وتراقب readiness وdeployment outcome. Test scripts خاصها تكون موجودة وترجع failure codes صحيحين. Echo ديال Slack/Email ما كيصيفطش notification.

Promote غير digest اللي دازت checks مع versioned config متوافقة. حافظ على previous digest وschema compatibility؛ rollback تقدر تطول ولا migration تمنعها. حدد شكون approve وشنو commit/digest approval كتغطي. Gate كتحتاج control ديال bypass paths وcredentials.
## حالات الفشل والنتائج

*   **فشل Integration Tests**: إلا طاحو التيستات فـ staging، الـ pipeline كيوقف قبل ما يوصل لـ 'Production Approval'. هكا الـ production كتبقى محمية.
*   **Timeout ديال Approval**: إلا تعطل الـ approval بزاف، الـ pipeline يقدر يتـ abort باش ما نطلعوش شي build قديم بزاف (stale) بالغلط.
*   **طياح الـ Registry**: إلا كان الـ image registry طايح ملي نبغيو نطلعو لـ production، الـ deployment غيفشل. هادشي كيبين علاش خاص الـ registry يكون highly available.

## تمرين

**السيناريو**: بغيتي تعدل الـ pipeline باش تضمن أن الـ production deployment ما يوقع حتى ينجحو integration tests ويكون كاين approval يدوي. لاحظتي أن الـ `Integration Tests` إلا طاحو، الـ pipeline كيسكيب الـ approval ولكن ما كيعلم حد علاش الـ release تبلوكات.

**السؤال**: فين خاصك تزيد logic ديال notification باش الفريق يعرف واش الـ build "Staging-Failed" ولا "Pending-Approval"؟ وكيفاش الـ immutable image كتضمن أن أي تصحيح (fix) فـ الكود ما يسكيبش المرحلة ديال staging؟

**الجواب**: الـ notification خاصها تكون فـ bloc `post { failure { ... } }` ولا فـ `catch` block خاص بـ integration tests. باش نضمنو أن الـ fix ما يسكيبش staging، الـ pipeline خاصو يكون خطي (linear): أي تغيير فـ الكود → commit hash جديد → image جديدة → deploy لـ staging ضروري → تيستات ضرورية → approval. ما يمكنش تـ "promote" شي fix نيشان لـ production حيت المرحلة ديال production كطلب image tag اللي ديجا داز من staging فـ نفس الـ execution ديال الـ pipeline.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
