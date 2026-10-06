---
title: "Sequence Diagrams: What Happens After the User Clicks a Button?"
description: "Learn how to visualize the chronological flow of messages between objects when a user triggers an action in a system."
pubDate: 2026-10-07T18:48:00.000Z
translationKey: 027-sequence-diagrams-what-happens-after-the-user-clicks-a-button
locale: en
tags: ["software-engineering","uml-modeling","learning-series"]
draft: false
---

These examples illustrate the concept; surrounding application setup and supporting definitions may be omitted.

Imagine you are explaining a feature to a new developer. You say, 'The user clicks buy, the system checks the stock, and then it sends an email.' While this sounds simple, in a complex system, it is easy to forget which specific object is responsible for which action. This is where Sequence Diagrams solve the confusion by mapping interactions over a timeline.

## The Logic of Lifelines and Messages
In a sequence diagram, we use lifelines (vertical dashed lines) to represent different objects or components. The horizontal arrows represent messages sent between them. Unlike a flowchart that shows decisions, a sequence diagram focuses on the *order* of communication. If Object A calls a method on Object B, the arrow goes from A to B, and Object B's lifeline shows an 'activation bar' to indicate it is currently processing the request.

## Example: Procurement Request Flow
Consider a procurement app where a requester submits a purchase request. The interaction follows this sequence:
1. **Requester** → **RequestController**: `submitRequest(data)`
2. **RequestController** → **RequestService**: `validateAndSave(request)`
3. **RequestService** → **RequestRepository**: `save(entity)`
4. **RequestRepository** → **RequestService**: `Confirmation`
5. **RequestService** → **RequestController**: `Success Response`
6. **RequestController** → **Requester**: `Display "Request Submitted"`

## Illustrative Code Excerpt
Here is how the `RequestController` might look in a Jakarta EE environment to trigger this sequence:

```java
@Path("/requests")
public class RequestController {
    @Inject
    private RequestService requestService;

    @POST
    public Response submitRequest(PurchaseRequest request) {
        // This call triggers the next arrow in the sequence diagram
        boolean result = requestService.validateAndSave(request);
        return result ? Response.ok().build() : Response.status(400).build();
    }
}
```

## Common mistake: confusing notation with capabilities
A sequence diagram is not restricted to a single straight path. Use an `alt` fragment for approval versus rejection, `opt` for an optional interaction, `loop` for repetition and `par` for parallel interactions. These fragments have UML semantics; arbitrary flowchart decision diamonds do not belong in a sequence diagram. Use an activity diagram when the main question is the overall business flow, and a sequence diagram when you need the participating lifelines and their ordered messages.
## Practical Exercise
**Scenario:** A Manager clicks "Approve" on a request. The system must update the status to 'Approved' and notify the Buyer.
**Task:** List the sequence of messages.
**Check:** Manager → ApprovalController → RequestService → RequestRepository (Update) → NotificationService (Notify Buyer) → Manager (Success).


## Further reading

- [OMG UML specification](https://www.omg.org/spec/UML/2.5.1)
