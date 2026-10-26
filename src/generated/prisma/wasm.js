
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  name: 'name',
  role: 'role',
  password: 'password',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  fcmToken: 'fcmToken'
};

exports.Prisma.BusScalarFieldEnum = {
  id: 'id',
  busNo: 'busNo',
  driverName: 'driverName',
  status: 'status',
  createdAt: 'createdAt',
  label: 'label'
};

exports.Prisma.LiveLocationScalarFieldEnum = {
  id: 'id',
  busId: 'busId',
  lat: 'lat',
  lng: 'lng',
  speed: 'speed',
  timestamp: 'timestamp'
};

exports.Prisma.StopScalarFieldEnum = {
  id: 'id',
  name: 'name',
  lat: 'lat',
  lng: 'lng',
  busId: 'busId',
  order: 'order',
  needsLocation: 'needsLocation',
  direction: 'direction',
  studentId: 'studentId'
};

exports.Prisma.SchoolScalarFieldEnum = {
  id: 'id',
  name: 'name',
  address: 'address',
  lat: 'lat',
  lng: 'lng',
  updatedAt: 'updatedAt',
  contactPhone: 'contactPhone'
};

exports.Prisma.AdminScalarFieldEnum = {
  id: 'id',
  email: 'email',
  password: 'password',
  name: 'name',
  createdAt: 'createdAt'
};

exports.Prisma.AttendanceScalarFieldEnum = {
  id: 'id',
  busId: 'busId',
  studentId: 'studentId',
  date: 'date',
  tripType: 'tripType',
  boarded: 'boarded',
  createdAt: 'createdAt',
  tripId: 'tripId',
  conductorId: 'conductorId',
  checkedAt: 'checkedAt',
  type: 'type'
};

exports.Prisma.DriverScalarFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  busId: 'busId',
  createdAt: 'createdAt',
  licenseNo: 'licenseNo',
  licenseExpiry: 'licenseExpiry',
  experience: 'experience'
};

exports.Prisma.ConductorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  phone: 'phone',
  busId: 'busId',
  createdAt: 'createdAt'
};

exports.Prisma.EmergencyScalarFieldEnum = {
  id: 'id',
  busId: 'busId',
  driverName: 'driverName',
  type: 'type',
  notes: 'notes',
  status: 'status',
  createdAt: 'createdAt'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  admissionNo: 'admissionNo',
  busId: 'busId',
  parentPhone: 'parentPhone',
  stopId: 'stopId',
  class: 'class',
  createdAt: 'createdAt',
  dropStopId: 'dropStopId',
  parentPhone2: 'parentPhone2',
  fatherName: 'fatherName',
  motherName: 'motherName'
};

exports.Prisma.RouteScalarFieldEnum = {
  id: 'id',
  name: 'name',
  busId: 'busId',
  startPoint: 'startPoint',
  endPoint: 'endPoint',
  createdAt: 'createdAt'
};

exports.Prisma.RouteStopScalarFieldEnum = {
  id: 'id',
  routeId: 'routeId',
  name: 'name',
  lat: 'lat',
  lng: 'lng',
  order: 'order',
  distanceFromStart: 'distanceFromStart',
  estimatedTime: 'estimatedTime',
  createdAt: 'createdAt'
};

exports.Prisma.TripScalarFieldEnum = {
  id: 'id',
  busId: 'busId',
  driverId: 'driverId',
  direction: 'direction',
  status: 'status',
  startedAt: 'startedAt',
  endedAt: 'endedAt',
  lastLat: 'lastLat',
  lastLng: 'lastLng',
  lastSpeed: 'lastSpeed',
  lastHeading: 'lastHeading',
  lastLocationAt: 'lastLocationAt',
  destName: 'destName',
  destLat: 'destLat',
  destLng: 'destLng'
};

exports.Prisma.TripStopScalarFieldEnum = {
  id: 'id',
  tripId: 'tripId',
  stopId: 'stopId',
  order: 'order',
  name: 'name',
  lat: 'lat',
  lng: 'lng',
  status: 'status',
  arrivedAt: 'arrivedAt',
  completedAt: 'completedAt'
};

exports.Prisma.NotificationLogScalarFieldEnum = {
  id: 'id',
  tripId: 'tripId',
  tripStopId: 'tripStopId',
  studentId: 'studentId',
  type: 'type',
  status: 'status',
  etaSeconds: 'etaSeconds',
  sentAt: 'sentAt',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.Role = exports.$Enums.Role = {
  PARENT: 'PARENT',
  DRIVER: 'DRIVER',
  CONDUCTOR: 'CONDUCTOR',
  ADMIN: 'ADMIN'
};

exports.BusStatus = exports.$Enums.BusStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_TRIP: 'ON_TRIP'
};

exports.TripDirection = exports.$Enums.TripDirection = {
  PICKUP: 'PICKUP',
  DROP: 'DROP'
};

exports.TripStatus = exports.$Enums.TripStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

exports.TripStopStatus = exports.$Enums.TripStopStatus = {
  PENDING: 'PENDING',
  ARRIVED: 'ARRIVED',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  CANCELLED: 'CANCELLED'
};

exports.Prisma.ModelName = {
  User: 'User',
  Bus: 'Bus',
  LiveLocation: 'LiveLocation',
  Stop: 'Stop',
  School: 'School',
  Admin: 'Admin',
  Attendance: 'Attendance',
  Driver: 'Driver',
  Conductor: 'Conductor',
  Emergency: 'Emergency',
  Student: 'Student',
  Route: 'Route',
  RouteStop: 'RouteStop',
  Trip: 'Trip',
  TripStop: 'TripStop',
  NotificationLog: 'NotificationLog'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "D:\\where is my bus\\backend\\src\\generated\\prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "D:\\where is my bus\\backend\\prisma\\schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../src/generated/prisma\"\n  previewFeatures = [\"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  phone     String   @unique\n  name      String?\n  role      Role     @default(PARENT)\n  password  String?\n  createdAt DateTime @default(now()) @db.Timestamp(6)\n  updatedAt DateTime @default(now()) @updatedAt @db.Timestamp(6)\n  fcmToken  String?\n}\n\nmodel Bus {\n  id         String    @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busNo      String    @unique\n  driverName String\n  status     BusStatus @default(INACTIVE)\n  createdAt  DateTime  @default(now()) @db.Timestamp(6)\n  label      String?\n}\n\nmodel LiveLocation {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId     String\n  lat       Float\n  lng       Float\n  speed     Float    @default(0)\n  timestamp DateTime @default(now()) @db.Timestamp(6)\n}\n\n// ── needsLocation added: true when a stop was auto-created by CSV bulk\n// import and geocoding either failed or returned a low-confidence\n// match — Admin must confirm/fix its lat/lng before it's trusted for\n// navigation/ETA. Manually-added stops (map picker) are always false. ──\nmodel Stop {\n  id            String        @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name          String\n  lat           Float\n  lng           Float\n  busId         String\n  order         Int\n  needsLocation Boolean       @default(false)\n  direction     TripDirection @default(PICKUP)\n  studentId     String?\n\n  @@index([busId, direction, order])\n}\n\n// ── NEW — one-time Admin setup: acts as the geocoding anchor for\n// auto-created stops and the destination for auto-generated routes. ──\nmodel School {\n  id           String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name         String\n  address      String?\n  lat          Float\n  lng          Float\n  updatedAt    DateTime @default(now()) @updatedAt @db.Timestamp(6)\n  contactPhone String?\n}\n\nmodel Admin {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  email     String   @unique\n  password  String\n  name      String\n  createdAt DateTime @default(now()) @db.Timestamp(6)\n}\n\nmodel Attendance {\n  id          String    @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId       String\n  studentId   String\n  date        String\n  tripType    String    @default(\"pickup\")\n  boarded     Boolean?  @default(false)\n  createdAt   DateTime  @default(now()) @db.Timestamp(6)\n  tripId      String?\n  conductorId String?\n  checkedAt   DateTime? @db.Timestamp(6)\n  type        String?\n\n  @@unique([tripId, studentId, type])\n}\n\nmodel Driver {\n  id            String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name          String\n  phone         String\n  busId         String?\n  createdAt     DateTime @default(now()) @db.Timestamp(6)\n  licenseNo     String?\n  licenseExpiry String?\n  experience    Int?     @default(0)\n}\n\nmodel Conductor {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name      String\n  phone     String\n  busId     String?\n  createdAt DateTime @default(now()) @db.Timestamp(6)\n}\n\nmodel Emergency {\n  id         String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId      String\n  driverName String?\n  type       String   @default(\"SOS\")\n  notes      String?\n  status     String?  @default(\"open\")\n  createdAt  DateTime @default(now()) @db.Timestamp(6)\n}\n\nmodel Student {\n  id           String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name         String\n  admissionNo  String\n  busId        String\n  parentPhone  String\n  stopId       String?\n  class        String?\n  createdAt    DateTime @default(now()) @db.Timestamp(6)\n  dropStopId   String?\n  parentPhone2 String?\n  fatherName   String?\n  motherName   String?\n\n  @@index([admissionNo])\n}\n\nenum Role {\n  PARENT\n  DRIVER\n  CONDUCTOR\n  ADMIN\n}\n\nenum BusStatus {\n  ACTIVE\n  INACTIVE\n  ON_TRIP\n}\n\nenum TripDirection {\n  PICKUP\n  DROP\n}\n\nenum TripStatus {\n  ACTIVE\n  COMPLETED\n  CANCELLED\n}\n\nenum TripStopStatus {\n  PENDING\n  ARRIVED\n  COMPLETED\n  SKIPPED\n  CANCELLED\n}\n\nmodel Route {\n  id         String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name       String\n  busId      String\n  startPoint String\n  endPoint   String?\n  createdAt  DateTime @default(now()) @db.Timestamp(6)\n\n  stops RouteStop[]\n}\n\n// ── FIX: @relation(...) must be written on a single line — the\n// original multi-line version (fields:/references:/onDelete: each on\n// their own line) is what Prisma 5.22's parser was rejecting. ──\nmodel RouteStop {\n  id                String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  routeId           String\n  name              String\n  lat               Float\n  lng               Float\n  order             Int\n  distanceFromStart Float    @default(0)\n  estimatedTime     Int      @default(0)\n  createdAt         DateTime @default(now()) @db.Timestamp(6)\n\n  route Route @relation(fields: [routeId], references: [id], onDelete: Cascade)\n}\n\nmodel Trip {\n  id             String        @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId          String\n  driverId       String\n  direction      TripDirection\n  status         TripStatus    @default(ACTIVE)\n  startedAt      DateTime      @default(now()) @db.Timestamp(6)\n  endedAt        DateTime?     @db.Timestamp(6)\n  lastLat        Float?\n  lastLng        Float?\n  lastSpeed      Float?\n  lastHeading    Float?\n  lastLocationAt DateTime?     @db.Timestamp(6)\n  destName       String?\n  destLat        Float?\n  destLng        Float?\n\n  stops TripStop[]\n\n  @@index([busId, status])\n}\n\nmodel TripStop {\n  id          String         @id @default(dbgenerated(\"gen_random_uuid()\"))\n  tripId      String\n  stopId      String\n  order       Int\n  name        String\n  lat         Float\n  lng         Float\n  status      TripStopStatus @default(PENDING)\n  arrivedAt   DateTime?      @db.Timestamp(6)\n  completedAt DateTime?      @db.Timestamp(6)\n\n  trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)\n\n  @@index([tripId, order])\n}\n\nmodel NotificationLog {\n  id         String    @id @default(dbgenerated(\"gen_random_uuid()\"))\n  tripId     String\n  tripStopId String\n  studentId  String\n  type       String\n  status     String\n  etaSeconds Int?\n  sentAt     DateTime? @db.Timestamp(6)\n  createdAt  DateTime  @default(now()) @db.Timestamp(6)\n\n  @@unique([tripId, tripStopId, studentId, type])\n}\n",
  "inlineSchemaHash": "918e1e2fa6018d17c72baafe0b890352683ed1c2b475eeab449be7c8146a9bab",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"fcmToken\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Bus\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busNo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"driverName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"BusStatus\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"label\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"LiveLocation\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"speed\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Stop\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"needsLocation\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"direction\",\"kind\":\"enum\",\"type\":\"TripDirection\"},{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"School\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"address\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"contactPhone\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Admin\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Attendance\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"date\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"boarded\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"tripId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"conductorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"checkedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Driver\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"licenseNo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"licenseExpiry\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"experience\",\"kind\":\"scalar\",\"type\":\"Int\"}],\"dbName\":null},\"Conductor\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Emergency\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"driverName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Student\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"admissionNo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentPhone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"class\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"dropStopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentPhone2\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fatherName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"motherName\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Route\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startPoint\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"endPoint\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"stops\",\"kind\":\"object\",\"type\":\"RouteStop\",\"relationName\":\"RouteToRouteStop\"}],\"dbName\":null},\"RouteStop\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"routeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"distanceFromStart\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"estimatedTime\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"route\",\"kind\":\"object\",\"type\":\"Route\",\"relationName\":\"RouteToRouteStop\"}],\"dbName\":null},\"Trip\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"driverId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"direction\",\"kind\":\"enum\",\"type\":\"TripDirection\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"TripStatus\"},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastLat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastLng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastSpeed\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastHeading\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastLocationAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"destName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"destLat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"destLng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"stops\",\"kind\":\"object\",\"type\":\"TripStop\",\"relationName\":\"TripToTripStop\"}],\"dbName\":null},\"TripStop\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"TripStopStatus\"},{\"name\":\"arrivedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"trip\",\"kind\":\"object\",\"type\":\"Trip\",\"relationName\":\"TripToTripStop\"}],\"dbName\":null},\"NotificationLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripStopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"etaSeconds\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"sentAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

