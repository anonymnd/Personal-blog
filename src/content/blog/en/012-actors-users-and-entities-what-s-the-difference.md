---
title: "Actors, Accounts and Domain Entities Are Different Things"
description: "Learn to separate interacting roles from authentication identities and business objects using a parcel locker scenario."
pubDate: 2026-10-06T18:48:00.000Z
translationKey: 012-actors-users-and-entities-what-s-the-difference
seriesOrder: 3
locale: en
tags: ["business-workflows","learning-series"]
draft: false
---

## The Conceptual Divide

A common failure in software design is collapsing the 'User' into a single object that handles authentication, business logic, and system interaction. To build a scalable system, you must decouple three distinct concepts: the Actor, the Account, and the Domain Entity.

1. **The Actor**: An external entity that interacts with the system to achieve a goal. Actors are roles, not people. An actor can be a human (e.g., a Courier) or an external system (e.g., a Payment Gateway). 
2. **The Account**: The security principal. This is the identity used for authentication (login/password, API key) and authorization (permissions). 
3. **The Domain Entity**: An object with a unique business identity that persists over time, regardless of who is interacting with it. For example, a 'Parcel' is an entity; it exists whether or not a Courier is currently scanning it.

## Worked Scenario: The Parcel Locker System

Choose the backend service as the system boundary. A sender, courier and recipient interact with that service in different roles. The locker device also sits outside this boundary and calls its API. If you instead model the entire physical locker product as the system, the device may become an internal component: actor classification depends on the boundary.

One person may send personal parcels and deliver work parcels using the same stable account. Conversely, a recipient might collect a parcel with a one-time pickup code without creating an account. The code is a credential or access capability, not an account. The application checks its validity and its authorization for the particular parcel before changing parcel and slot state.
## Implementation Artifact: Role-Based Identity Model

For a design review, create a classification inventory rather than immediately creating one class per actor.

| Thing | Classification | Why it matters |
| --- | --- | --- |
| Sender | Actor role | Describes a goal at the chosen boundary |
| Account A101 | Stable application account | May be used by a person playing several roles |
| Pickup code | Credential/capability | Proves a narrowly scoped right; it is not a new account |
| Parcel P52 | Domain entity | Keeps business identity throughout delivery |
| Locker slot S8 | Domain entity | Has identity and occupancy state |
| Locker device calling the backend | External system actor for this boundary | Initiates an API interaction |

The same real-world object can participate in several views. A device can be an external actor in an interaction model and have an inventory record in a domain model. Do not turn every role into a subclass of User, and do not assume every domain entity requires a login.
## Failure Cases and Edge Cases

When one person is both courier and recipient, distinguish which role they exercise in the interaction from the parcel they may access. A role label alone does not establish ownership. When a guest uses a pickup code, validate its expiry and parcel scope without pretending a temporary code is a persistent account. When the system boundary changes, revisit the actor list. These are modeling decisions; they do not require a particular authentication implementation.
## Exercise

A maintenance technician needs to unlock a locker for repair and view operational diagnostics, but should not see recipient contact details in the application. Identify the actor, account and affected entities.

**Check:** MaintenanceTechnician is an actor role; the technician may authenticate with an employee account. LockerSlot is the affected domain entity. An authorization rule controls unlocking and diagnostic access while excluding recipient contact data. Physical access to an opened locker needs separate operational safeguards; hiding an API field cannot guarantee that someone with physical access cannot inspect a parcel.
