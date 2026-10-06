---
title: "شنو هو Jenkinsfile؟"
description: "دليل مبسط باش تفهم Pipeline-as-Code باستعمال Jenkinsfile باش تـautomati-er الخدمة ديال الـ deployment."
pubDate: 2026-10-16T16:48:00.000Z
translationKey: 241-what-is-a-jenkinsfile
locale: ar
tags: ["software-engineering","deployment-devops","learning-series"]
draft: false
---

تخيل معايا عندك واحد العملية ديال deployment معقدة: خاصك تـbuildi application Java، دوز tests، ومن بعد تصيفطها للسيرفر. إلا كنتي كدير هادشي غير بـ cliques فـ interface ديال Jenkins، غادي تضيع history ديال التغييرات، وإلا طاح السيرفر، كاع داكشي لي كونفيغيريتي كيمشي. هنا فين كيجي Jenkinsfile باش يرجع الـ pipeline ديالك عبارة عن كود.

## مفهوم Pipeline-as-Code
الـ Jenkinsfile هو واحد الملف textي فيه كاع التعريفات ديال الـ Pipeline. بلاصة ما تبقى تبرك على Boutons فـ site، كتكتب الخطوات ديال build و test و deploy فـ script وكتديرو فـ Git repository ديالك. هكا كيولي الـ CI/CD process متبع ومسجل (versioned) مع الكود ديال application.

## الفرق بين Declarative و Scripted
Jenkins فيه جوج طرق: Declarative هي لي خدامين بيها بزاف دابا حيت منظمة، ساهلة فـ القراية، وكتعاونك تلقى الأخطاء دغيا. أما Scripted فهي كتعتمد على Groovy code، كتعطيك حرية كتر ولكن صعيبة فـ maintenance. أغلب الفرق كيختارو Declarative حيت ساهلة.

## مثال تطبيقي: App ديال Procurement
نفترضو عندنا app ديال الشراء (Procurement) فين الموظف كيصيفط demande. الـ pipeline خاصو يـbuildi l'app ويدوز tests قبل ما يـdeployيها.

```groovy
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package -DskipTests'
            }
        }
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying Procurement App to Staging...'
            }
        }
    }
}
```
فـ هاد المثال، إلا الـ `mvn test` فشل، الـ pipeline كيوقف تماك، وباش ما تطلعش نسخة فيها bug للسيرفر.

## غلط شائع: كتابة الـ Passwords فـ الكود
بزاف ديال الناس كيكتبو passwords أو API keys نيشان فـ Jenkinsfile. حيت هاد الملف كيكون فـ Git، أي واحد عندو access للـ repo يقدر يشوف السيرت ديالك.

**التصحيح:** خاصك تخدم بـ `credentials()` helper ديال Jenkins باش تجيب السيرت لي مخبيين فـ Jenkins Credentials Provider.

## تمرين تطبيقي
**سؤال:** أما بلاصة فـ Declarative Jenkinsfile لي كنكتبو فيها الأوامر لي بغينا نـexecuti-وها (بحال shell scripts)؟

**الجواب:** الـ block ديال `steps` لي كيكون وسط `stage`.

## باش تزيد تفهم

- [Kubernetes probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
