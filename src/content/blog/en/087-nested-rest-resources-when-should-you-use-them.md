---
title: "Nested REST Resources: When Should You Use Them?"
description: "A guide to deciding between nested and flat URI structures for managing related entities in a REST API."
pubDate: 2026-10-10T06:48:00.000Z
translationKey: 087-nested-rest-resources-when-should-you-use-them
locale: en
tags: ["software-engineering","rest-api","learning-series"]
draft: false
---

Imagine you are building a procurement system. You have `Requests` and `Items`. A common struggle is deciding if an item should be accessed via `/items/{id}` or `/requests/{requestId}/items/{itemId}`. If you nest too deeply, your URLs become monstrous; if you don't nest enough, you lose the intuitive hierarchy of your data.

## The Logic of Nesting
Nesting is used to represent a 'belongs-to' or 'parent-child' relationship. You should use nested resources when a child entity cannot exist independently of the parent or when the relationship is the primary way users discover the data. In our procurement app, an `Item` only makes sense within the context of a `Request`.

## When to Stay Flat
Avoid nesting when the resource is a first-class citizen. If a manager needs to search for all `Items` across all `Requests` to analyze spending, a flat structure like `/items?type=laptop` is more efficient. A good rule of thumb is to limit nesting to one level deep. Beyond `/parents/{id}/children`, the API becomes fragile and difficult to maintain.

## Worked Example: Procurement Workflow
Consider a requester adding an item to a purchase request. 

**Request:** `POST /requests/101/items` 
**Body:** `{"product": "Mechanical Keyboard", "qty": 1}`
**Outcome:** The server creates the item linked to request 101 and returns `201 Created` with a `Location: /requests/101/items/505` header.

To update that specific item, you might use: 
`PATCH /requests/101/items/505` 
**Body:** `{"qty": 2}`

## Common Mistake: Over-Nesting
A frequent error is creating paths like `/departments/5/managers/2/requests/101/items/505`. This forces the client to know every single parent ID just to update one item. 

**Correction:** Use the nested path for creation and discovery, but use a flat path for direct manipulation: `PATCH /items/505`. This keeps the API clean while preserving the relationship during initial navigation.

## Practical Exercise
Scenario: You have `Orders` and `Shipments`. A shipment always belongs to one order. How should you design the endpoint to list all shipments for a specific order?

**Check:** The ideal URI is `GET /orders/{orderId}/shipments` because it clearly defines the relationship.

## Further reading

- [HTTP Semantics (RFC 9110)](https://www.rfc-editor.org/rfc/rfc9110.html)
