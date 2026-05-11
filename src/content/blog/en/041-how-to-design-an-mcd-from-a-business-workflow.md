---
title: "How to Design an MCD From a Business Workflow"
description: "Learn how to transform real-world business processes into a conceptual data model using the Merise methodology."
pubDate: 2026-10-08T08:48:00.000Z
translationKey: 041-how-to-design-an-mcd-from-a-business-workflow
locale: en
tags: ["software-engineering","database-design","learning-series"]
draft: false
---

Many beginners struggle when moving from a written business process to a database schema. They often start by creating tables immediately, only to realize later that they missed a critical relationship or duplicated data. The secret is the MCD (Modèle Conceptuel des Données), which focuses on *what* the data is, not *how* it is stored.

## Identify domain entities and their identifiers
Look for things with an identity and a lifecycle, rather than turning every noun into an entity. In a procurement app, Requester, Manager and Buyer can be roles of the same Employee. PurchaseRequest, Product and Order are other candidate entities. At this conceptual stage, an identifier distinguishes one occurrence from another; it is not yet a choice of SQL primary-key type. A request can also have properties such as its creation date and estimated amount.
## Let the rules determine participation
Ask the question in both directions. One employee can submit zero or many requests; each submitted request has exactly one requester. A manager can approve many requests, while a pending request has no approver yet. Under a one-approval rule, a request therefore participates in zero or one approval association. If the business needs several approvals per request, model that different rule explicitly instead of keeping the same cardinality.
## Place relationship attributes deliberately
Quantity belongs to the association between a request and a product: the same product can appear in different requests with different quantities. For this many-to-many association, a logical model normally uses a RequestLine table. An association attribute does not always require its own table, however. If each request has at most one approval, the approver identifier and approval date may be stored on the Request table. A separate Approval entity becomes useful when approvals have their own history, status or multiple occurrences.
## Worked example with Merise cardinalities
The numbers at an entity's endpoint state how many times one occurrence of that entity can participate in the association. For this explicitly simplified workflow:

```text
Employee (0,N) -- submits  -- Request (1,1)
Manager  (0,N) -- approves -- Request (0,1)
Request  (0,N) -- contains -- Product (0,N)
                 [quantity is an association attribute]
```

The last rule allows an empty draft and products that have not been requested yet. Submission can require at least one line as an additional state-dependent business rule. Manager here denotes a role of Employee, not necessarily a separate stored entity. Specify these assumptions beside the model so readers do not mistake them for universal business rules.
## Common Mistake: Mixing Levels
A frequent error is adding foreign keys (like `manager_id`) directly into the MCD. The MCD is conceptual; it uses relationship lines, not columns. Foreign keys only appear in the Logical Data Model (MLD).

## Practical Exercise
**Scenario**: A project management tool where one Project has many Tasks, and one Task belongs to exactly one Project. 
**Task**: Identify the entities and the cardinality of the relationship.

**Answer**: Entities: `Project` and `Task`. Relationship: `Project` (0,N) <--- (1,1) `Task`.
