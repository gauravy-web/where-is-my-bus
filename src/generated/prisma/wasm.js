
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
  label: 'label',
  locationMode: 'locationMode',
  activeSource: 'activeSource',
  sourceChangedAt: 'sourceChangedAt'
};

exports.Prisma.GpsDeviceScalarFieldEnum = {
  id: 'id',
  deviceId: 'deviceId',
  name: 'name',
  busId: 'busId',
  credentialHash: 'credentialHash',
  credentialIssuedAt: 'credentialIssuedAt',
  revokedAt: 'revokedAt',
  verifiedAt: 'verifiedAt',
  validFixCount: 'validFixCount',
  lastSeenAt: 'lastSeenAt',
  lastFixAt: 'lastFixAt',
  lastLat: 'lastLat',
  lastLng: 'lastLng',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
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
  type: 'type',
  absenceReason: 'absenceReason'
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

exports.Prisma.AbsenceNotificationScalarFieldEnum = {
  id: 'id',
  studentId: 'studentId',
  parentUserId: 'parentUserId',
  busId: 'busId',
  tripId: 'tripId',
  stopId: 'stopId',
  date: 'date',
  reason: 'reason',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  cancelledAt: 'cancelledAt'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  busId: 'busId',
  senderId: 'senderId',
  senderRole: 'senderRole',
  senderName: 'senderName',
  content: 'content',
  type: 'type',
  createdAt: 'createdAt',
  editedAt: 'editedAt',
  deletedAt: 'deletedAt',
  deletedBy: 'deletedBy',
  isPinned: 'isPinned'
};

exports.Prisma.ChatReadStatusScalarFieldEnum = {
  id: 'id',
  busId: 'busId',
  userId: 'userId',
  lastReadAt: 'lastReadAt',
  lastMessageId: 'lastMessageId'
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

exports.LocationMode = exports.$Enums.LocationMode = {
  MOBILE_PRIMARY: 'MOBILE_PRIMARY',
  DEVICE_PRIMARY: 'DEVICE_PRIMARY'
};

exports.LocationSource = exports.$Enums.LocationSource = {
  MOBILE: 'MOBILE',
  DEVICE: 'DEVICE',
  NONE: 'NONE'
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

exports.AbsenceStatus = exports.$Enums.AbsenceStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  LATE: 'LATE'
};

exports.MessageType = exports.$Enums.MessageType = {
  MESSAGE: 'MESSAGE',
  ANNOUNCEMENT: 'ANNOUNCEMENT'
};

exports.Prisma.ModelName = {
  User: 'User',
  Bus: 'Bus',
  GpsDevice: 'GpsDevice',
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
  NotificationLog: 'NotificationLog',
  AbsenceNotification: 'AbsenceNotification',
  ChatMessage: 'ChatMessage',
  ChatReadStatus: 'ChatReadStatus'
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
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "generator client {\n  provider        = \"prisma-client-js\"\n  output          = \"../src/generated/prisma\"\n  previewFeatures = [\"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"postgresql\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel User {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  phone     String   @unique\n  name      String?\n  role      Role     @default(PARENT)\n  password  String?\n  createdAt DateTime @default(now()) @db.Timestamp(6)\n  updatedAt DateTime @default(now()) @updatedAt @db.Timestamp(6)\n  fcmToken  String?\n}\n\nmodel Bus {\n  id              String         @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busNo           String         @unique\n  driverName      String\n  status          BusStatus      @default(INACTIVE)\n  createdAt       DateTime       @default(now()) @db.Timestamp(6)\n  label           String?\n  // GPS device management: configured mode and the source currently authoritative.\n  locationMode    LocationMode   @default(MOBILE_PRIMARY)\n  activeSource    LocationSource @default(MOBILE)\n  sourceChangedAt DateTime?      @db.Timestamp(6)\n}\n\nenum LocationMode {\n  MOBILE_PRIMARY\n  DEVICE_PRIMARY\n}\n\nenum LocationSource {\n  MOBILE\n  DEVICE\n  NONE\n}\n\n// Hardware GPS tracker assigned to at most one bus. Only the SHA-256 hash of\n// its secret is stored.\nmodel GpsDevice {\n  id                 String    @id @default(dbgenerated(\"gen_random_uuid()\"))\n  deviceId           String    @unique\n  name               String?\n  busId              String?   @unique\n  credentialHash     String\n  credentialIssuedAt DateTime  @default(now()) @db.Timestamp(6)\n  revokedAt          DateTime? @db.Timestamp(6)\n  verifiedAt         DateTime? @db.Timestamp(6)\n  validFixCount      Int       @default(0)\n  lastSeenAt         DateTime? @db.Timestamp(6)\n  lastFixAt          DateTime? @db.Timestamp(6)\n  lastLat            Float?\n  lastLng            Float?\n  createdAt          DateTime  @default(now()) @db.Timestamp(6)\n  updatedAt          DateTime  @default(now()) @updatedAt @db.Timestamp(6)\n}\n\nmodel LiveLocation {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId     String\n  lat       Float\n  lng       Float\n  speed     Float    @default(0)\n  timestamp DateTime @default(now()) @db.Timestamp(6)\n}\n\n// ── needsLocation added: true when a stop was auto-created by CSV bulk\n// import and geocoding either failed or returned a low-confidence\n// match — Admin must confirm/fix its lat/lng before it's trusted for\n// navigation/ETA. Manually-added stops (map picker) are always false. ──\nmodel Stop {\n  id            String        @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name          String\n  lat           Float\n  lng           Float\n  busId         String\n  order         Int\n  needsLocation Boolean       @default(false)\n  direction     TripDirection @default(PICKUP)\n  studentId     String?\n\n  @@index([busId, direction, order])\n}\n\n// ── NEW — one-time Admin setup: acts as the geocoding anchor for\n// auto-created stops and the destination for auto-generated routes. ──\nmodel School {\n  id           String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name         String\n  address      String?\n  lat          Float\n  lng          Float\n  updatedAt    DateTime @default(now()) @updatedAt @db.Timestamp(6)\n  contactPhone String?\n}\n\nmodel Admin {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  email     String   @unique\n  password  String\n  name      String\n  createdAt DateTime @default(now()) @db.Timestamp(6)\n}\n\nmodel Attendance {\n  id            String    @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId         String\n  studentId     String\n  date          String\n  tripType      String    @default(\"pickup\")\n  boarded       Boolean?  @default(false)\n  createdAt     DateTime  @default(now()) @db.Timestamp(6)\n  tripId        String?\n  conductorId   String?\n  checkedAt     DateTime? @db.Timestamp(6)\n  type          String?\n  absenceReason String?\n\n  @@unique([tripId, studentId, type])\n  @@index([absenceReason])\n}\n\nmodel Driver {\n  id            String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name          String\n  phone         String\n  busId         String?\n  createdAt     DateTime @default(now()) @db.Timestamp(6)\n  licenseNo     String?\n  licenseExpiry String?\n  experience    Int?     @default(0)\n}\n\nmodel Conductor {\n  id        String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name      String\n  phone     String\n  busId     String?\n  createdAt DateTime @default(now()) @db.Timestamp(6)\n}\n\nmodel Emergency {\n  id         String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId      String\n  driverName String?\n  type       String   @default(\"SOS\")\n  notes      String?\n  status     String?  @default(\"open\")\n  createdAt  DateTime @default(now()) @db.Timestamp(6)\n}\n\nmodel Student {\n  id           String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name         String\n  admissionNo  String\n  busId        String\n  parentPhone  String\n  stopId       String?\n  class        String?\n  createdAt    DateTime @default(now()) @db.Timestamp(6)\n  dropStopId   String?\n  parentPhone2 String?\n  fatherName   String?\n  motherName   String?\n\n  absenceNotifications AbsenceNotification[]\n\n  @@index([admissionNo])\n}\n\nenum Role {\n  PARENT\n  DRIVER\n  CONDUCTOR\n  ADMIN\n}\n\nenum BusStatus {\n  ACTIVE\n  INACTIVE\n  ON_TRIP\n}\n\nenum TripDirection {\n  PICKUP\n  DROP\n}\n\nenum TripStatus {\n  ACTIVE\n  COMPLETED\n  CANCELLED\n}\n\nenum TripStopStatus {\n  PENDING\n  ARRIVED\n  COMPLETED\n  SKIPPED\n  CANCELLED\n}\n\nmodel Route {\n  id         String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  name       String\n  busId      String\n  startPoint String\n  endPoint   String?\n  createdAt  DateTime @default(now()) @db.Timestamp(6)\n\n  stops RouteStop[]\n}\n\n// ── FIX: @relation(...) must be written on a single line — the\n// original multi-line version (fields:/references:/onDelete: each on\n// their own line) is what Prisma 5.22's parser was rejecting. ──\nmodel RouteStop {\n  id                String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  routeId           String\n  name              String\n  lat               Float\n  lng               Float\n  order             Int\n  distanceFromStart Float    @default(0)\n  estimatedTime     Int      @default(0)\n  createdAt         DateTime @default(now()) @db.Timestamp(6)\n\n  route Route @relation(fields: [routeId], references: [id], onDelete: Cascade)\n}\n\nmodel Trip {\n  id             String        @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId          String\n  driverId       String\n  direction      TripDirection\n  status         TripStatus    @default(ACTIVE)\n  startedAt      DateTime      @default(now()) @db.Timestamp(6)\n  endedAt        DateTime?     @db.Timestamp(6)\n  lastLat        Float?\n  lastLng        Float?\n  lastSpeed      Float?\n  lastHeading    Float?\n  lastLocationAt DateTime?     @db.Timestamp(6)\n  destName       String?\n  destLat        Float?\n  destLng        Float?\n\n  stops                TripStop[]\n  absenceNotifications AbsenceNotification[]\n\n  @@index([busId, status])\n}\n\nmodel TripStop {\n  id          String         @id @default(dbgenerated(\"gen_random_uuid()\"))\n  tripId      String\n  stopId      String\n  order       Int\n  name        String\n  lat         Float\n  lng         Float\n  status      TripStopStatus @default(PENDING)\n  arrivedAt   DateTime?      @db.Timestamp(6)\n  completedAt DateTime?      @db.Timestamp(6)\n\n  trip Trip @relation(fields: [tripId], references: [id], onDelete: Cascade)\n\n  @@index([tripId, order])\n}\n\nmodel NotificationLog {\n  id         String    @id @default(dbgenerated(\"gen_random_uuid()\"))\n  tripId     String\n  tripStopId String\n  studentId  String\n  type       String\n  status     String\n  etaSeconds Int?\n  sentAt     DateTime? @db.Timestamp(6)\n  createdAt  DateTime  @default(now()) @db.Timestamp(6)\n\n  @@unique([tripId, tripStopId, studentId, type])\n}\n\nenum AbsenceStatus {\n  ACTIVE\n  CANCELLED\n  LATE\n}\n\nenum MessageType {\n  MESSAGE\n  ANNOUNCEMENT\n}\n\nmodel AbsenceNotification {\n  id           String        @id @default(dbgenerated(\"gen_random_uuid()\"))\n  studentId    String\n  parentUserId String\n  busId        String\n  tripId       String?\n  stopId       String\n  date         String\n  reason       String?\n  status       AbsenceStatus @default(ACTIVE)\n  createdAt    DateTime      @default(now()) @db.Timestamp(6)\n  updatedAt    DateTime      @default(now()) @updatedAt @db.Timestamp(6)\n  cancelledAt  DateTime?     @db.Timestamp(6)\n\n  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)\n  trip    Trip?   @relation(fields: [tripId], references: [id], onDelete: SetNull)\n\n  @@unique([studentId, busId, date])\n  @@index([busId, date])\n  @@index([studentId, date])\n  @@index([tripId])\n}\n\nmodel ChatMessage {\n  id         String      @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId      String\n  senderId   String\n  senderRole Role\n  senderName String\n  content    String\n  type       MessageType @default(MESSAGE)\n  createdAt  DateTime    @default(now()) @db.Timestamp(6)\n  editedAt   DateTime?   @db.Timestamp(6)\n  deletedAt  DateTime?   @db.Timestamp(6)\n  deletedBy  String?\n  isPinned   Boolean     @default(false)\n\n  @@index([busId, createdAt])\n  @@index([busId, type, isPinned])\n  @@index([createdAt])\n}\n\nmodel ChatReadStatus {\n  id            String   @id @default(dbgenerated(\"gen_random_uuid()\"))\n  busId         String\n  userId        String\n  lastReadAt    DateTime @default(now()) @db.Timestamp(6)\n  lastMessageId String?\n\n  @@unique([busId, userId])\n  @@index([userId])\n}\n",
  "inlineSchemaHash": "b5c2270594bdeb8d5fc1d0ae58bcf04ec35c7f170b4cd8a56009d8f754b193db",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"User\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"role\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"fcmToken\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Bus\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busNo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"driverName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"BusStatus\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"label\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"locationMode\",\"kind\":\"enum\",\"type\":\"LocationMode\"},{\"name\":\"activeSource\",\"kind\":\"enum\",\"type\":\"LocationSource\"},{\"name\":\"sourceChangedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"GpsDevice\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"deviceId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"credentialHash\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"credentialIssuedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"revokedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"verifiedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"validFixCount\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"lastSeenAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastFixAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastLat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastLng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"LiveLocation\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"speed\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Stop\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"needsLocation\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"direction\",\"kind\":\"enum\",\"type\":\"TripDirection\"},{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"School\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"address\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"contactPhone\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Admin\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"email\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"password\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Attendance\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"date\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripType\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"boarded\",\"kind\":\"scalar\",\"type\":\"Boolean\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"tripId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"conductorId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"checkedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"absenceReason\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null},\"Driver\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"licenseNo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"licenseExpiry\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"experience\",\"kind\":\"scalar\",\"type\":\"Int\"}],\"dbName\":null},\"Conductor\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"phone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Emergency\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"driverName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"notes\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"Student\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"admissionNo\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentPhone\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"class\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"dropStopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentPhone2\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"fatherName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"motherName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"absenceNotifications\",\"kind\":\"object\",\"type\":\"AbsenceNotification\",\"relationName\":\"AbsenceNotificationToStudent\"}],\"dbName\":null},\"Route\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startPoint\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"endPoint\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"stops\",\"kind\":\"object\",\"type\":\"RouteStop\",\"relationName\":\"RouteToRouteStop\"}],\"dbName\":null},\"RouteStop\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"routeId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"distanceFromStart\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"estimatedTime\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"route\",\"kind\":\"object\",\"type\":\"Route\",\"relationName\":\"RouteToRouteStop\"}],\"dbName\":null},\"Trip\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"driverId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"direction\",\"kind\":\"enum\",\"type\":\"TripDirection\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"TripStatus\"},{\"name\":\"startedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"endedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastLat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastLng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastSpeed\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastHeading\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lastLocationAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"destName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"destLat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"destLng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"stops\",\"kind\":\"object\",\"type\":\"TripStop\",\"relationName\":\"TripToTripStop\"},{\"name\":\"absenceNotifications\",\"kind\":\"object\",\"type\":\"AbsenceNotification\",\"relationName\":\"AbsenceNotificationToTrip\"}],\"dbName\":null},\"TripStop\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"order\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lat\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"lng\",\"kind\":\"scalar\",\"type\":\"Float\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"TripStopStatus\"},{\"name\":\"arrivedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"completedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"trip\",\"kind\":\"object\",\"type\":\"Trip\",\"relationName\":\"TripToTripStop\"}],\"dbName\":null},\"NotificationLog\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripStopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"etaSeconds\",\"kind\":\"scalar\",\"type\":\"Int\"},{\"name\":\"sentAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"}],\"dbName\":null},\"AbsenceNotification\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"parentUserId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"tripId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"stopId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"date\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"reason\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"status\",\"kind\":\"enum\",\"type\":\"AbsenceStatus\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"cancelledAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"student\",\"kind\":\"object\",\"type\":\"Student\",\"relationName\":\"AbsenceNotificationToStudent\"},{\"name\":\"trip\",\"kind\":\"object\",\"type\":\"Trip\",\"relationName\":\"AbsenceNotificationToTrip\"}],\"dbName\":null},\"ChatMessage\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"senderId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"senderRole\",\"kind\":\"enum\",\"type\":\"Role\"},{\"name\":\"senderName\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"content\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"type\",\"kind\":\"enum\",\"type\":\"MessageType\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"editedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"deletedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"deletedBy\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"isPinned\",\"kind\":\"scalar\",\"type\":\"Boolean\"}],\"dbName\":null},\"ChatReadStatus\":{\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"busId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"userId\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"lastReadAt\",\"kind\":\"scalar\",\"type\":\"DateTime\"},{\"name\":\"lastMessageId\",\"kind\":\"scalar\",\"type\":\"String\"}],\"dbName\":null}},\"enums\":{},\"types\":{}}")
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

