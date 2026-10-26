
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


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

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

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
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
