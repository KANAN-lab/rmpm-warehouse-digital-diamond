\# MASTER PROMPT

\# RMPM WAREHOUSE DIGITAL TWIN

\# MASTER DATA + TRANSACTION + BLIND CYCLE COUNT + 3D WAREHOUSE DESIGNER



============================================================

0\. ROLE AND MISSION

============================================================



You are acting as a:



\- Principal Software Architect

\- Warehouse Management System Architect

\- Inventory Control Specialist

\- RMPM Warehouse Process Analyst

\- Database Architect

\- 3D Digital Twin Architect

\- Three.js Engineer

\- PDA / Mobile Warehouse UX Engineer

\- Data Governance Architect

\- QA Engineer

\- Security Architect



Your mission is to design the COMPLETE FOUNDATION of a production-ready:



"RMPM WAREHOUSE DIGITAL TWIN \& CONTROL TOWER"



The system must combine:



1\. Warehouse Master Data

2\. Inventory Master Data

3\. Operational Master Data

4\. User \& Security Master Data

5\. 3D Warehouse Digital Twin

6\. 3D Warehouse Layout Designer

7\. Blind Stock Opname / Blind Cycle Count

8\. PDA Cycle Count

9\. Inventory Transaction Engine

10\. Picking

11\. Batching

12\. Replenishment

13\. Bin-to-Bin

14\. Receiving

15\. Putaway

16\. Aging

17\. Location Accuracy

18\. Inventory Accuracy

19\. Traceability

20\. Exception Management

21\. Reporting

22\. KPI Dashboard

23\. Audit Trail



DO NOT start by blindly writing application code.



First create the architecture, data model, business rules, relationships, validation rules, workflows, API contracts, UI architecture, 3D architecture, security model, and test strategy.



The resulting system must be:



\- Production-ready

\- Modular

\- Maintainable

\- Scalable

\- Offline-capable where appropriate

\- API-first

\- Database-driven

\- Event/audit driven

\- Role-based

\- Warehouse-operation friendly

\- 3D-native

\- PDA-friendly

\- Desktop-friendly

\- Browser-based

\- No dependence on third-party warehouse layout design software

\- No hard-coded warehouse structure

\- No hard-coded rack/bin layout

\- No hard-coded business rules

\- No hidden assumptions



============================================================

1\. NON-NEGOTIABLE PRINCIPLES

============================================================



1\. MASTER DATA MUST BE THE FOUNDATION.



2\. TRANSACTION DATA MUST BE SEPARATED FROM MASTER DATA.



3\. CURRENT INVENTORY STATE MUST BE DERIVED/MAINTAINED FROM VALID TRANSACTIONS.



4\. 3D VISUALIZATION MUST NOT BECOME THE SOURCE OF TRUTH.



The source of truth is:



DATABASE + MASTER DATA + TRANSACTION LEDGER.



Three.js is the visualization and interaction layer.



5\. The warehouse structure must never be hard-coded.



6\. User must be able to create/edit warehouse layout directly inside the application.



7\. No external 3D warehouse designer should be required.



8\. Blind Cycle Count is a CORE module, not an optional feature.



9\. Counter MUST NOT see system quantity during Blind SO.



10\. 100% COUNT COMPLETION != 100% INVENTORY ACCURACY.



11\. Wrong Location must be traceable.



12\. Every inventory movement must have an audit trail.



13\. Count history must never be silently overwritten.



14\. Recount must remain blind.



15\. Warehouse must remain LIVE during cycle count unless a specific controlled freeze is configured.



16\. Any inventory movement during an active count must be detectable and traceable.



17\. No automatic inventory adjustment without configurable approval workflow.



18\. All business-critical rules must be configurable.



19\. Every important action must be auditable.



20\. Do not create unnecessary microservices.



Prefer a modular monolith initially unless there is a strong architectural reason otherwise.



============================================================

2\. REQUIRED OUTPUTS

============================================================



Create the following documents before implementation:



/docs

&#x20;   01\_SYSTEM\_ARCHITECTURE.md

&#x20;   02\_MASTER\_DATA\_SPEC.md

&#x20;   03\_LOCATION\_HIERARCHY.md

&#x20;   04\_INVENTORY\_MODEL.md

&#x20;   05\_TRANSACTION\_MODEL.md

&#x20;   06\_BLIND\_CYCLE\_COUNT\_SPEC.md

&#x20;   07\_PDA\_WORKFLOW.md

&#x20;   08\_3D\_DIGITAL\_TWIN\_SPEC.md

&#x20;   09\_3D\_LAYOUT\_EDITOR\_SPEC.md

&#x20;   10\_PICKING\_SPEC.md

&#x20;   11\_BATCHING\_SPEC.md

&#x20;   12\_REPLENISHMENT\_SPEC.md

&#x20;   13\_RECEIVING\_PUTAWAY\_SPEC.md

&#x20;   14\_BIN\_TO\_BIN\_SPEC.md

&#x20;   15\_AGING\_SPEC.md

&#x20;   16\_EXCEPTION\_MANAGEMENT.md

&#x20;   17\_TRACEABILITY\_SPEC.md

&#x20;   18\_REPORTING\_KPI\_SPEC.md

&#x20;   19\_ROLE\_PERMISSION\_SPEC.md

&#x20;   20\_AUDIT\_LOG\_SPEC.md

&#x20;   21\_API\_SPEC.md

&#x20;   22\_DATABASE\_SCHEMA.md

&#x20;   23\_EVENT\_MODEL.md

&#x20;   24\_OFFLINE\_SYNC\_SPEC.md

&#x20;   25\_SECURITY\_SPEC.md

&#x20;   26\_VALIDATION\_RULES.md

&#x20;   27\_TEST\_STRATEGY.md

&#x20;   28\_ACCEPTANCE\_CRITERIA.md

&#x20;   29\_DEPLOYMENT\_SPEC.md

&#x20;   30\_GLOSSARY.md



Also create:



README.md



and:



CHANGELOG.md



============================================================

3\. MASTER DATA ARCHITECTURE

============================================================



Design Master Data in these groups.



\--------------------------------------------

A. PHYSICAL WAREHOUSE MASTER

\--------------------------------------------



Warehouse

Zone

Area

Lane

Line

Rack

Rack Type

Level

Bin

Storage Type

Staging Area

Quarantine Area

Dock

Door

Aisle

Floor

Room

Temperature Zone if applicable

Hazard Zone if applicable



\--------------------------------------------

B. INVENTORY MASTER

\--------------------------------------------



Material

Material Category

Material Group

Material Type

Batch

MID

Pallet

Container

UOM

UOM Conversion

Packaging Configuration

Material Dimensions

Material Weight

Material Volume

Shelf Life

Expiry Rule

Lot Rule



\--------------------------------------------

C. OPERATION MASTER

\--------------------------------------------



Putaway Rule

Picking Rule

Replenishment Rule

Cycle Count Rule

Aging Rule

FIFO Rule

FEFO Rule

Capacity Rule

Location Assignment Rule

Material Location Compatibility Rule

Batch Rule

Movement Rule

Tolerance Rule

Approval Rule

Exception Rule

Priority Rule



\--------------------------------------------

D. SECURITY MASTER

\--------------------------------------------



User

Role

Permission

Department

Warehouse Assignment

Device

PDA

Scanner

Session

Authentication Policy



\--------------------------------------------

E. 3D DIGITAL TWIN MASTER

\--------------------------------------------



3D Object

3D Object Type

3D Template

Rack Template

Bin Template

Pallet Template

Warehouse Layout

Layout Version

Object Position

Object Rotation

Object Scale

Object Parent

Object Metadata

Material Visualization Template

Camera Preset

View Layer

Display Rule



============================================================

4\. LOCATION HIERARCHY

============================================================



The location hierarchy must support:



WAREHOUSE

&#x20;   ↓

ZONE

&#x20;   ↓

AREA

&#x20;   ↓

LANE / LINE

&#x20;   ↓

AISLE

&#x20;   ↓

RACK

&#x20;   ↓

LEVEL

&#x20;   ↓

BIN



But do NOT assume every warehouse uses every level.



The hierarchy must be configurable.



Example:



Warehouse

└── Zone A

&#x20;   └── Lane 01

&#x20;       └── Rack A01

&#x20;           ├── Level 01

&#x20;           │   ├── Bin 01

&#x20;           │   └── Bin 02

&#x20;           ├── Level 02

&#x20;           │   ├── Bin 01

&#x20;           │   └── Bin 02



Support other structures.



Every location must have:



\- unique ID

\- human-readable code

\- barcode

\- QR code option

\- parent location

\- location type

\- capacity

\- dimensions

\- status

\- active/inactive

\- coordinates

\- 3D object reference

\- operational rules

\- audit fields



============================================================

5\. LOCATION ACCURACY

============================================================



The system must distinguish:



Expected Location



vs



Actual Physical Location



Support:



WRONG WAREHOUSE

WRONG ZONE

WRONG AREA

WRONG LANE

WRONG LINE

WRONG AISLE

WRONG RACK

WRONG LEVEL

WRONG BIN



Every location mismatch must be traceable.



============================================================

6\. 3D DIGITAL TWIN

============================================================



Use Three.js or an equivalent modern WebGL/WebGPU-compatible architecture.



The 3D system must be a REAL DIGITAL TWIN.



It must not simply be a decorative warehouse model.



The 3D warehouse must be generated from Master Data.



Example:



Database:



Rack A01

width = 2.4m

depth = 1.1m

height = 6m

levels = 4



The application generates the rack automatically.



The 3D view must support:



\- zoom

\- pan

\- orbit

\- selection

\- hover

\- object highlighting

\- labels

\- measurement

\- grid

\- snapping

\- alignment

\- object duplication

\- grouping

\- hierarchy

\- visibility

\- layers

\- search

\- filter

\- camera presets

\- top view

\- front view

\- side view

\- perspective

\- orthographic

\- fullscreen



============================================================

7\. 3D WAREHOUSE DESIGNER

============================================================



This is REQUIRED.



User must be able to design warehouse directly from the application.



No third-party CAD software should be required for normal warehouse layout creation.



Provide:



DESIGN MODE



Tools:



\- Add Warehouse

\- Add Zone

\- Add Rack

\- Add Level

\- Add Bin

\- Add Aisle

\- Add Lane

\- Add Staging

\- Add Door

\- Add Wall

\- Add Column

\- Add Dock

\- Add Custom Object



Object manipulation:



\- Move

\- Rotate

\- Scale

\- Duplicate

\- Delete

\- Align

\- Distribute

\- Snap

\- Group

\- Ungroup



Numeric property editing:



X

Y

Z

Rotation X

Rotation Y

Rotation Z

Width

Depth

Height



Do not rely only on mouse dragging.



Users must be able to enter exact dimensions.



============================================================

8\. PARAMETRIC RACK GENERATOR

============================================================



Create a parametric rack generator.



Example:



Rack:



width = 2.7m

depth = 1.1m

height = 6m



Levels:



5



Bins per level:



4



The application should automatically generate:



Rack

→ Levels

→ Bins

→ Coordinates

→ Barcode IDs



This must dramatically reduce manual design work.



============================================================

9\. 3D LAYOUT VERSIONING

============================================================



Every layout change must support:



Draft

Published

Archived



Never silently overwrite a production layout.



Support:



Layout Version

Created By

Created At

Published By

Published At

Change Summary



============================================================

10\. 3D TO DATABASE MAPPING

============================================================



Every 3D object must map to a real business entity.



Example:



3D Object:

OBJ-RACK-A01



Database:

RACK-A01



3D Bin:

OBJ-BIN-A01-L02-B04



Database:

BIN-A01-L02-B04



Do NOT allow orphan business-critical objects.



============================================================

11\. INVENTORY MODEL

============================================================



Inventory hierarchy:



Material

&#x20;   ↓

Batch

&#x20;   ↓

Pallet

&#x20;   ↓

MID

&#x20;   ↓

Location



But design flexibly because not every warehouse transaction necessarily uses all entities.



MID must be a first-class entity if operationally applicable.



Each inventory record may include:



Material

Batch

MID

Pallet

Quantity

UOM

Location

Status

Expiry

Production Date

Receipt Date

Last Movement

Owner

Quality Status



============================================================

12\. INVENTORY STATUS

============================================================



Support configurable states such as:



AVAILABLE

BLOCKED

QUARANTINE

DAMAGED

EXPIRED

HOLD

ALLOCATED

PICKED

STAGED

IN\_TRANSIT

UNKNOWN



Do not hard-code business semantics without documenting them.



============================================================

13\. TRANSACTION LEDGER

============================================================



Every inventory movement must generate a transaction.



Minimum transaction types:



RECEIVING

PUTAWAY

PICKING

BATCHING

REPLENISHMENT

BIN\_TO\_BIN

TRANSFER

RETURN

ADJUSTMENT

CYCLE\_COUNT

STAGING

DISPATCH

HOLD

RELEASE

DAMAGE

SCRAP



Every transaction must contain:



Transaction ID

Transaction Type

Source Location

Destination Location

Material

Batch

MID

Pallet

Quantity

UOM

Operator

Device

Timestamp

Reference Document

Reason

Status

Correlation ID

Previous State

New State



============================================================

14\. IMMUTABLE TRANSACTION HISTORY

============================================================



Never delete historical inventory transactions.



Corrections must generate a new transaction.



Never:



UPDATE HISTORY



Instead:



ORIGINAL EVENT

\+

CORRECTION EVENT



============================================================

15\. BLIND CYCLE COUNT

============================================================



Blind Cycle Count is a CORE MODULE.



Counter MUST NOT see:



System Quantity

Expected Quantity

Variance

Previous Count

Previous Variance



during counting.



Counter only sees:



Location

Material identity where appropriate

MID

Batch

Barcode

Physical Quantity Entry



============================================================

16\. CYCLE COUNT MODES

============================================================



Support:



Rack Mode

Zone Mode

Area Mode

Lane Mode

Line Mode

Bin Mode

Level Mode

MID Mode

Pallet Mode

Material Mode

Batch Mode



============================================================

17\. PDA CYCLE COUNT

============================================================



PDA must support:



Scan Warehouse

Scan Zone

Scan Rack

Scan Level

Scan Bin

Scan MID

Scan Pallet

Scan Material

Scan Batch



Manual entry must also exist.



Every input must record:



SCAN

or

MANUAL



============================================================

18\. BLIND COUNT SCREEN

============================================================



The counter screen must NEVER display:



System Qty

Expected Qty

Variance



Example:



CYCLE COUNT

CC-20260825-00001



LOCATION

A01-R03-L02-B04



SCAN ITEM



MID

\[\_\_\_\_\_\_\_\_\_\_]



BATCH

\[\_\_\_\_\_\_\_\_\_\_]



PHYSICAL QTY

\[\_\_\_\_\_\_\_\_\_\_]



UOM

KG



CONFIRM



============================================================

19\. COUNT TARGET

============================================================



Every Cycle Count must create explicit Count Targets.



Count Target can be:



Location

MID

Pallet

Material

Batch



Every target must have state:



NOT\_STARTED

IN\_PROGRESS

COUNTED

RECOUNT\_REQUIRED

VERIFIED

COMPLETED

SKIPPED

INVALID



SKIPPED is NOT equal to COMPLETED.



============================================================

20\. 100% COUNT COMPLETION

============================================================



Completion must be based on Count Targets.



Formula:



Completion %

=

Completed Targets

/

Total Targets

× 100



100% means:



Every required target has been physically processed.



It does NOT mean inventory is accurate.



============================================================

21\. CYCLE COUNT DASHBOARD

============================================================



Supervisor must see live:



Completion %

Total Targets

Completed

Pending

Variance

Missing

Unexpected

Wrong Location

Recount Required

Quantity Accuracy

Location Accuracy



============================================================

22\. LIVE WAREHOUSE OPERATION

============================================================



Cycle Count must not require warehouse-wide blocking.



Warehouse can continue:



Picking

Replenishment

Putaway

Receiving

Bin-to-Bin

Batching

Dispatch



during Cycle Count.



============================================================

23\. MOVEMENT DURING COUNT

============================================================



If a location is being counted and movement occurs:



Create:



COUNT\_IMPACT\_EVENT



Record:



Cycle Count ID

Location

Movement ID

Movement Type

Quantity

Operator

Timestamp



The reconciliation engine must account for this.



============================================================

24\. COUNT SNAPSHOT

============================================================



At count start create:



Inventory Snapshot



including:



Location

Material

Batch

MID

Pallet

Quantity

Timestamp

Inventory Version



============================================================

25\. RECONCILIATION

============================================================



Do not simply compare:



System Qty vs Physical Qty



without considering movement during the count.



The reconciliation engine must calculate the correct expected state at count time.



============================================================

26\. EMPTY LOCATION

============================================================



Empty bins are valid count results.



Counter must be able to confirm:



LOCATION EMPTY



============================================================

27\. UNEXPECTED MATERIAL

============================================================



If counter finds material not expected in the location:



Create:



UNEXPECTED\_MATERIAL



Do not reject the observation.



============================================================

28\. WRONG LOCATION

============================================================



If material is physically found somewhere other than expected:



Create:



WRONG\_LOCATION



Classify:



Wrong Warehouse

Wrong Zone

Wrong Lane

Wrong Line

Wrong Rack

Wrong Level

Wrong Bin



============================================================

29\. MISSING MATERIAL

============================================================



If expected material cannot be found:



MISSING



Do not immediately adjust inventory.



Use:



MISSING\_PENDING\_RECOUNT



============================================================

30\. RECOUNT

============================================================



Recount must be independent.



Counter B must not see:



Counter A result

System quantity

Variance



Every count attempt is immutable.



Example:



Count #1 = 1,180 KG

Count #2 = 1,175 KG



Both must remain in history.



============================================================

31\. QUANTITY ACCURACY

============================================================



Create a configurable Quantity Accuracy calculation.



Handle:



Zero System Quantity

UOM Conversion

Tolerance

Rounding

Partial Pallet

Different Material Types



Do not assume one universal formula is always valid.



============================================================

32\. LOCATION ACCURACY

============================================================



Create:



Location Accuracy %



Correctly Located Inventory

/

Total Verified Inventory



Support material-level and MID-level calculation where appropriate.



============================================================

33\. TRACEABILITY

============================================================



For every exception, system must be able to answer:



Where is it now?

Where should it be?

Where was it previously?

When did it move?

Who moved it?

Which transaction moved it?

Why did it move?

Which process created the error?



============================================================

34\. MOVEMENT GRAPH

============================================================



Provide a movement timeline/graph:



Location A

↓

Staging

↓

Location B

↓

Location C



Every movement node includes:



Timestamp

Operator

Transaction

Reason



============================================================

35\. ROOT CAUSE

============================================================



Wrong Location reasons:



Putaway Error

Picking Error

Replenishment Error

Bin-to-Bin Error

Return Process

Temporary Storage

Emergency Storage

Barcode Error

System Mapping Error

Operator Error

Unknown



Configurable.



============================================================

36\. OPERATION MODULES

============================================================



The architecture must support:



RECEIVING



PO / ASN

↓

Receiving

↓

Inspection

↓

Putaway



PUTAWAY



Source

↓

Destination

↓

Rule Validation

↓

Transaction



PICKING



Order

↓

Allocation

↓

Pick Task

↓

Confirmation

↓

Staging



BATCHING



Batch creation

Batch validation

Material association

Quantity

Status



REPLENISHMENT



Min/Max

Demand

Trigger

Source

Destination

Task

Confirmation



BIN-TO-BIN



Source

↓

MID

↓

Destination

↓

Confirmation



AGING



Receipt Date

Production Date

Expiry Date

Current Date



Generate aging buckets dynamically.



============================================================

37\. AGING

============================================================



Do not hard-code aging buckets.



Support configurable:



0-30

31-60

61-90

91-180

180+



or custom buckets.



Also support:



Near Expiry

Expired

Long Stay

Slow Moving

Dead Stock



============================================================

38\. REPORTING

============================================================



Minimum KPI:



Inventory Accuracy

Quantity Accuracy

Location Accuracy

Cycle Count Completion

Wrong Location %

Missing %

Unexpected %

Recount %

Aging

Stock Value

Stock Quantity

Inventory Turnover where data is available

Picking Accuracy

Picking Productivity

Replenishment Performance

Bin-to-Bin Activity

Putaway Accuracy

Receiving Accuracy



============================================================

39\. 3D REPORTING

============================================================



3D must support visualization layers:



Inventory

Cycle Count

Aging

Utilization

Location Accuracy

Picking

Replenishment

Exceptions

Movement

Capacity



============================================================

40\. 3D HEATMAP

============================================================



Example:



GREEN

Correct



YELLOW

Pending



ORANGE

Variance



RED

Wrong Location



PURPLE

Missing



BLUE

Recount



Do not hard-code colors into business logic.



Create a configurable visualization theme.



============================================================

41\. 3D CLICK-THROUGH

============================================================



Click:



Warehouse

→ Zone

→ Rack

→ Level

→ Bin

→ MID



At each level show relevant business information.



============================================================

42\. 3D SEARCH

============================================================



Search:



MID

Material

Batch

Bin

Rack

Zone

Pallet



System should automatically:



Find

Focus Camera

Highlight Object

Display Information



============================================================

43\. 3D DESIGNER UX

============================================================



Provide:



SELECT

MOVE

ROTATE

SCALE

DUPLICATE

DELETE

ALIGN

SNAP

MEASURE

GROUP

UNGROUP



Property panel:



Position

Rotation

Dimension

Parent

Object Type

Business ID

Barcode



============================================================

44\. SNAP \& GRID

============================================================



Support:



Grid

Snap to Grid

Snap to Object

Alignment

Distance Measurement



Warehouse dimensions must support real-world units.



Prefer metric units.



============================================================

45\. 3D PERFORMANCE

============================================================



Design for potentially:



Thousands of bins

Thousands of MID

Hundreds of racks

Large warehouse layouts



Use:



InstancedMesh

LOD where useful

Culling

Lazy loading

Efficient geometry

Efficient state updates

Batch rendering

Avoid unnecessary object duplication



Do not render every object with an expensive unique material unnecessarily.



============================================================

46\. 3D STATE

============================================================



Do not store entire warehouse state only inside Three.js.



Three.js should consume:



Warehouse State API



and render it.



============================================================

47\. API

============================================================



Design REST or modern equivalent API for:



Master Data

Locations

Inventory

Transactions

Cycle Counts

Count Targets

Recounts

Exceptions

Traceability

3D Layout

Users

Roles

Reports



Provide:



Endpoint

Method

Request

Response

Validation

Authentication

Authorization

Error Codes



============================================================

48\. EVENT MODEL

============================================================



Define domain events such as:



InventoryReceived

InventoryPutAway

InventoryPicked

InventoryBatched

InventoryReplenished

InventoryMoved

CycleCountStarted

CountRecorded

CountCompleted

RecountRequested

WrongLocationDetected

VarianceDetected

AdjustmentApproved

LayoutPublished



============================================================

49\. AUDIT

============================================================



Every critical operation must log:



Who

What

When

Where

Before

After

Reason

Device

IP/session where appropriate

Correlation ID



============================================================

50\. SECURITY

============================================================



Implement RBAC.



Example:



ADMIN

WAREHOUSE\_MANAGER

SUPERVISOR

INVENTORY\_CONTROLLER

COUNTER

PICKER

PUTAWAY\_OPERATOR

REPLENISHMENT\_OPERATOR

VIEWER



Permissions must be granular.



Example:



cycle\_count.create

cycle\_count.count

cycle\_count.view\_variance

cycle\_count.approve

inventory.adjust

layout.edit

layout.publish

master\_data.edit



============================================================

51\. MASTER DATA GOVERNANCE

============================================================



Every master data table should support:



ID

Code

Name

Status

Effective From

Effective To if required

Created By

Created At

Updated By

Updated At



Avoid hard deletion for business-critical master data.



Prefer:



ACTIVE

INACTIVE

ARCHIVED



============================================================

52\. DATA VALIDATION

============================================================



Validate:



Unique codes

Parent-child relationship

Duplicate barcode

Duplicate location

Invalid hierarchy

Invalid UOM

Invalid conversion

Capacity overflow

Invalid material-location mapping

Invalid batch

Invalid MID

Invalid transaction

Invalid status transition



============================================================

53\. DATABASE DESIGN

============================================================



Produce complete ERD.



Clearly separate:



MASTER

TRANSACTION

CURRENT STATE

AUDIT

CONFIGURATION

ANALYTICS



Identify:



PK

FK

Unique Constraints

Indexes

Composite Indexes

Check Constraints



Optimize for:



Location lookup

MID lookup

Material lookup

Batch lookup

Transaction history

Cycle Count

3D state queries

Traceability



============================================================

54\. INDEXING

============================================================



Explicitly identify indexes for:



location\_code

barcode

mid

material\_code

batch

transaction\_id

cycle\_count\_id

timestamp

status



and appropriate composite indexes.



============================================================

55\. OFFLINE PDA

============================================================



PDA must support intermittent network.



Architecture:



Server

↓

Task Download

↓

Local Queue

↓

Physical Count

↓

Local Validation

↓

Sync Queue

↓

Server Validation

↓

Conflict Resolution



Never silently overwrite server state.



============================================================

56\. OFFLINE CONFLICT

============================================================



If PDA counted:



MID-001 at Location A



while server moved:



MID-001 to Location B



the system must detect conflict.



Never automatically hide the conflict.



Create:



SYNC\_CONFLICT



with resolution workflow.



============================================================

57\. DEVICE MANAGEMENT

============================================================



PDA/device must have:



Device ID

User

OS

App Version

Last Sync

Connection State

Status



============================================================

58\. ERROR HANDLING

============================================================



Errors must be understandable to warehouse users.



Example:



BAD:



"Foreign key violation."



GOOD:



"Bin A01-R03-L02-B04 tidak dapat digunakan karena Rack A01-R03 sedang inactive."



Technical logs can contain detailed errors.



============================================================

59\. NO HARD-CODING

============================================================



Do NOT hard-code:



Warehouse

Zone

Rack

Bin

Material

Batch

MID

Aging bucket

Tolerance

Reason code

Movement type

Role

Permission

3D layout



Everything must be configurable.



============================================================

60\. IMPORT / EXPORT

============================================================



Master Data should support:



CSV

Excel



where appropriate.



Provide validation before import.



Never import directly into production without validation.



Show:



Valid Rows

Invalid Rows

Duplicates

Warnings

Errors



============================================================

61\. MASTER DATA UI

============================================================



Every master data screen should provide:



List

Search

Filter

Sort

Create

Edit

View

Deactivate

Import

Export

History



Use confirmation for destructive actions.



============================================================

62\. MASTER DATA DEPENDENCY

============================================================



Document dependencies.



Example:



Warehouse

↓

Zone

↓

Rack

↓

Level

↓

Bin



Material

↓

Batch

↓

MID



UOM

↓

UOM Conversion



============================================================

63\. SEED DATA

============================================================



Create realistic sample warehouse data.



At minimum:



1 Warehouse

3 Zones

Multiple Racks

Multiple Levels

Multiple Bins

Multiple Materials

Multiple Batches

Multiple MID

Multiple Pallets



Use fictional data.



============================================================

64\. TEST DATA

============================================================



Create scenarios:



Normal inventory

Wrong location

Missing stock

Unexpected stock

Wrong batch

Wrong MID

Movement during count

Recount

Offline count

Sync conflict

Empty bin

Mixed material

Capacity overflow

Expired material

Near expiry

Invalid barcode

Duplicate barcode



============================================================

65\. TEST STRATEGY

============================================================



Include:



Unit Test

Integration Test

API Test

Database Test

Workflow Test

Security Test

PDA Test

Offline Test

Sync Test

3D Interaction Test

Performance Test

Load Test

Regression Test

UAT



============================================================

66\. ACCEPTANCE TEST

============================================================



Create explicit Given / When / Then scenarios.



Example:



GIVEN

Bin A01-R03-L02-B04 contains 1,000 KG in system.



WHEN

Counter performs Blind Count.



THEN

Counter cannot see 1,000 KG.



WHEN

Counter enters 980 KG.



THEN

System stores 980 KG.



AND

variance is visible only to authorized users.



============================================================

67\. IMPORTANT BUSINESS SCENARIO

============================================================



Scenario:



System:



MID-001

Material RM001

Batch B001

Quantity 1,000 KG

Expected Location A01-R03-L02-B04



Physical:



MID-001

found at B02-R01-L03-B02



Counter must be able to record the observation.



System must produce:



WRONG\_LOCATION



Expected:

A01-R03-L02-B04



Actual:

B02-R01-L03-B02



Then trace:



Last Correct Location

Previous Location

Movement

Operator

Timestamp

Reason



============================================================

68\. LIVE COUNT SCENARIO

============================================================



At 10:00:



Counter starts count.



At 10:04:



Picking moves 200 KG.



At 10:08:



Counter finishes.



System must identify that movement occurred during count.



Do not produce a false variance.



============================================================

69\. 3D + SO SCENARIO

============================================================



Supervisor opens 3D warehouse.



Selects:



Rack A01.



System shows:



Cycle Count:

82%



Select Level 02.



Shows:



72%.



Select Bin B04.



Shows:



WRONG LOCATION.



Click:



TRACE.



System shows movement history.



============================================================

70\. PERFORMANCE REQUIREMENTS

============================================================



Define targets for:



Initial page load

3D load

API response

PDA scan response

Count confirmation

Search

Traceability

Dashboard refresh



Use measurable targets.



============================================================

71\. OBSERVABILITY

============================================================



Implement/log:



Application errors

API errors

Transaction failures

Sync failures

PDA offline queue

Cycle Count anomalies

Database errors

3D rendering performance



============================================================

72\. BACKUP / RECOVERY

============================================================



Document:



Database backup

Recovery

Transaction durability

Audit preservation

Layout version recovery

Master data recovery



============================================================

73\. DEPLOYMENT

============================================================



Document:



Development

Testing

Staging

Production



Environment variables.



Secrets must never be committed.



============================================================

74\. ARCHITECTURAL DECISION RECORD

============================================================



Create ADRs for major decisions:



Why Three.js

Why chosen frontend

Why chosen backend

Why chosen database

Why modular monolith or services

Why event model

Why offline architecture

Why Blind Cycle Count architecture

Why database is source of truth

Why 3D is visualization layer



============================================================

75\. DO NOT MAKE THESE MISTAKES

============================================================



DO NOT:



\- hard-code warehouse dimensions

\- hard-code rack positions

\- hard-code bin codes

\- hard-code material

\- store inventory only inside 3D

\- expose system quantity to counter

\- overwrite count history

\- delete transactions

\- treat 100% completion as 100% accuracy

\- ignore movement during counting

\- ignore wrong location

\- allow arbitrary inventory adjustment

\- mix master and transaction tables

\- create orphan 3D objects

\- assume all warehouses have identical hierarchy

\- assume all materials use the same UOM

\- assume all materials use batches

\- assume every location has identical capacity

\- assume warehouse is always offline

\- assume warehouse is always online

\- build UI before defining business rules



============================================================

76\. REQUIRED FINAL DELIVERABLE

============================================================



After completing analysis, produce:



1\. System Architecture

2\. Master Data Catalog

3\. Master Data ERD

4\. Location Hierarchy

5\. Inventory ERD

6\. Transaction ERD

7\. Cycle Count ERD

8\. Audit ERD

9\. 3D Object Model

10\. 3D Layout Architecture

11\. PDA Workflow

12\. Cycle Count State Machine

13\. Inventory State Machine

14\. Transaction State Machine

15\. API Contract

16\. Event Catalog

17\. Role Permission Matrix

18\. Validation Matrix

19\. Exception Matrix

20\. KPI Definition

21\. Reporting Specification

22\. Offline Sync Architecture

23\. Security Architecture

24\. Test Plan

25\. Acceptance Criteria

26\. Deployment Plan

27\. Seed Data

28\. Sample API Payloads

29\. Sample Database Schema

30\. Sample UI Wireframes



============================================================

77\. IMPLEMENTATION ORDER

============================================================



DO NOT implement everything at once.



Recommended order:



PHASE 1

Architecture



PHASE 2

Database + Master Data



PHASE 3

Location Hierarchy



PHASE 4

Inventory State



PHASE 5

Transaction Engine



PHASE 6

Blind Cycle Count



PHASE 7

PDA



PHASE 8

3D Digital Twin



PHASE 9

3D Layout Designer



PHASE 10

Picking



PHASE 11

Replenishment



PHASE 12

Bin-to-Bin



PHASE 13

Receiving + Putaway



PHASE 14

Batching



PHASE 15

Aging



PHASE 16

Exception + Traceability



PHASE 17

Reporting



PHASE 18

Optimization



============================================================

78\. BEFORE CODING

============================================================



Before writing implementation code:



1\. Inspect requirements.

2\. Identify missing requirements.

3\. Identify contradictions.

4\. Identify ambiguous business rules.

5\. Identify assumptions.

6\. Identify dependencies.

7\. Identify risks.

8\. Identify required Master Data.

9\. Identify required Transaction Data.

10\. Identify required Configuration.

11\. Identify required Permissions.

12\. Identify required APIs.

13\. Identify required 3D objects.

14\. Identify required PDA workflows.



Then create:



REQUIREMENT\_GAP\_ANALYSIS.md



Do NOT silently invent business rules.



If a business rule is unknown:



mark it:



\[BUSINESS DECISION REQUIRED]



Then propose a recommended default.



============================================================

79\. IMPORTANT: DO NOT ASK TOO MANY QUESTIONS

============================================================



If information is missing:



1\. Make a reasonable industry-standard assumption.

2\. Clearly mark it.

3\. Continue architecture work.

4\. Put it into:

BUSINESS\_DECISIONS.md



Do not block the entire project unnecessarily.



============================================================

80\. FINAL QUALITY CHECK

============================================================



Before declaring the architecture complete, perform a:



"REQUIREMENT COVERAGE AUDIT"



Create:



REQUIREMENT\_COVERAGE\_MATRIX.md



Columns:



Requirement

Module

Database Entity

API

UI

PDA

3D

Audit

Test

Status



Every requirement must have:



Covered

Partially Covered

Missing



There must be ZERO:



MISSING



for critical requirements.



============================================================

81\. FINAL SELF-REVIEW

============================================================



Before finalizing, ask yourself:



Can a warehouse operator actually use this?



Can a PDA operator count without seeing system quantity?



Can the warehouse continue operating during SO?



Can the system detect movement during count?



Can we identify wrong bin?



Can we identify wrong rack?



Can we identify wrong zone?



Can we trace who moved the material?



Can we know when it moved?



Can we know where it came from?



Can we know where it should have been?



Can we perform recount without bias?



Can supervisor see live progress?



Can we reach 100% count completion reliably?



Can 100% completion be different from 100% accuracy?



Can the warehouse be built directly inside the application?



Can a new rack be added without modifying source code?



Can bins be generated automatically?



Can 3D objects map to real database entities?



Can the system handle thousands of bins?



Can the PDA operate offline?



Can sync conflicts be detected?



Can inventory history be audited?



Can inventory adjustment be controlled?



Can master data be imported safely?



Can the system support a different warehouse hierarchy?



Can business rules change without code modification?



Can every critical requirement be tested?



If any answer is NO:



DO NOT declare the architecture complete.



============================================================

82\. FINAL INSTRUCTION

============================================================



Think like you are designing a real enterprise warehouse system that will be used by:



Warehouse Operator

PDA Counter

Picker

Putaway Operator

Replenishment Operator

Inventory Controller

Supervisor

Warehouse Manager

IT

Auditor

Management



The objective is not to create a visually impressive demo.



The objective is to create a:



REAL

ACCURATE

AUDITABLE

TRACEABLE

CONFIGURABLE

SCALABLE

PRODUCTION-READY



RMPM WAREHOUSE DIGITAL TWIN.



The 3D warehouse must become a visual operational interface to the real warehouse data.



The Blind Cycle Count must become the accuracy engine.



The Master Data must become the foundation.



The Transaction Ledger must become the history.



The Digital Twin must become the spatial representation.



The PDA must become the physical data collection interface.



The Control Tower must become the management interface.



Do not skip any layer.



Do not start coding until the architecture and data model are sufficiently defined.

