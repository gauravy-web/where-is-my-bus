
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Bus
 * 
 */
export type Bus = $Result.DefaultSelection<Prisma.$BusPayload>
/**
 * Model LiveLocation
 * 
 */
export type LiveLocation = $Result.DefaultSelection<Prisma.$LiveLocationPayload>
/**
 * Model Stop
 * 
 */
export type Stop = $Result.DefaultSelection<Prisma.$StopPayload>
/**
 * Model School
 * 
 */
export type School = $Result.DefaultSelection<Prisma.$SchoolPayload>
/**
 * Model Admin
 * 
 */
export type Admin = $Result.DefaultSelection<Prisma.$AdminPayload>
/**
 * Model Attendance
 * 
 */
export type Attendance = $Result.DefaultSelection<Prisma.$AttendancePayload>
/**
 * Model Driver
 * 
 */
export type Driver = $Result.DefaultSelection<Prisma.$DriverPayload>
/**
 * Model Conductor
 * 
 */
export type Conductor = $Result.DefaultSelection<Prisma.$ConductorPayload>
/**
 * Model Emergency
 * 
 */
export type Emergency = $Result.DefaultSelection<Prisma.$EmergencyPayload>
/**
 * Model Student
 * 
 */
export type Student = $Result.DefaultSelection<Prisma.$StudentPayload>
/**
 * Model Route
 * 
 */
export type Route = $Result.DefaultSelection<Prisma.$RoutePayload>
/**
 * Model RouteStop
 * 
 */
export type RouteStop = $Result.DefaultSelection<Prisma.$RouteStopPayload>
/**
 * Model Trip
 * 
 */
export type Trip = $Result.DefaultSelection<Prisma.$TripPayload>
/**
 * Model TripStop
 * 
 */
export type TripStop = $Result.DefaultSelection<Prisma.$TripStopPayload>
/**
 * Model NotificationLog
 * 
 */
export type NotificationLog = $Result.DefaultSelection<Prisma.$NotificationLogPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Role: {
  PARENT: 'PARENT',
  DRIVER: 'DRIVER',
  CONDUCTOR: 'CONDUCTOR',
  ADMIN: 'ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]


export const BusStatus: {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_TRIP: 'ON_TRIP'
};

export type BusStatus = (typeof BusStatus)[keyof typeof BusStatus]


export const TripDirection: {
  PICKUP: 'PICKUP',
  DROP: 'DROP'
};

export type TripDirection = (typeof TripDirection)[keyof typeof TripDirection]


export const TripStatus: {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export type TripStatus = (typeof TripStatus)[keyof typeof TripStatus]


export const TripStopStatus: {
  PENDING: 'PENDING',
  ARRIVED: 'ARRIVED',
  COMPLETED: 'COMPLETED',
  SKIPPED: 'SKIPPED',
  CANCELLED: 'CANCELLED'
};

export type TripStopStatus = (typeof TripStopStatus)[keyof typeof TripStopStatus]

}

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

export type BusStatus = $Enums.BusStatus

export const BusStatus: typeof $Enums.BusStatus

export type TripDirection = $Enums.TripDirection

export const TripDirection: typeof $Enums.TripDirection

export type TripStatus = $Enums.TripStatus

export const TripStatus: typeof $Enums.TripStatus

export type TripStopStatus = $Enums.TripStopStatus

export const TripStopStatus: typeof $Enums.TripStopStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs>;

  /**
   * `prisma.bus`: Exposes CRUD operations for the **Bus** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Buses
    * const buses = await prisma.bus.findMany()
    * ```
    */
  get bus(): Prisma.BusDelegate<ExtArgs>;

  /**
   * `prisma.liveLocation`: Exposes CRUD operations for the **LiveLocation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more LiveLocations
    * const liveLocations = await prisma.liveLocation.findMany()
    * ```
    */
  get liveLocation(): Prisma.LiveLocationDelegate<ExtArgs>;

  /**
   * `prisma.stop`: Exposes CRUD operations for the **Stop** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Stops
    * const stops = await prisma.stop.findMany()
    * ```
    */
  get stop(): Prisma.StopDelegate<ExtArgs>;

  /**
   * `prisma.school`: Exposes CRUD operations for the **School** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Schools
    * const schools = await prisma.school.findMany()
    * ```
    */
  get school(): Prisma.SchoolDelegate<ExtArgs>;

  /**
   * `prisma.admin`: Exposes CRUD operations for the **Admin** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Admins
    * const admins = await prisma.admin.findMany()
    * ```
    */
  get admin(): Prisma.AdminDelegate<ExtArgs>;

  /**
   * `prisma.attendance`: Exposes CRUD operations for the **Attendance** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Attendances
    * const attendances = await prisma.attendance.findMany()
    * ```
    */
  get attendance(): Prisma.AttendanceDelegate<ExtArgs>;

  /**
   * `prisma.driver`: Exposes CRUD operations for the **Driver** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Drivers
    * const drivers = await prisma.driver.findMany()
    * ```
    */
  get driver(): Prisma.DriverDelegate<ExtArgs>;

  /**
   * `prisma.conductor`: Exposes CRUD operations for the **Conductor** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Conductors
    * const conductors = await prisma.conductor.findMany()
    * ```
    */
  get conductor(): Prisma.ConductorDelegate<ExtArgs>;

  /**
   * `prisma.emergency`: Exposes CRUD operations for the **Emergency** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Emergencies
    * const emergencies = await prisma.emergency.findMany()
    * ```
    */
  get emergency(): Prisma.EmergencyDelegate<ExtArgs>;

  /**
   * `prisma.student`: Exposes CRUD operations for the **Student** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Students
    * const students = await prisma.student.findMany()
    * ```
    */
  get student(): Prisma.StudentDelegate<ExtArgs>;

  /**
   * `prisma.route`: Exposes CRUD operations for the **Route** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Routes
    * const routes = await prisma.route.findMany()
    * ```
    */
  get route(): Prisma.RouteDelegate<ExtArgs>;

  /**
   * `prisma.routeStop`: Exposes CRUD operations for the **RouteStop** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more RouteStops
    * const routeStops = await prisma.routeStop.findMany()
    * ```
    */
  get routeStop(): Prisma.RouteStopDelegate<ExtArgs>;

  /**
   * `prisma.trip`: Exposes CRUD operations for the **Trip** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Trips
    * const trips = await prisma.trip.findMany()
    * ```
    */
  get trip(): Prisma.TripDelegate<ExtArgs>;

  /**
   * `prisma.tripStop`: Exposes CRUD operations for the **TripStop** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TripStops
    * const tripStops = await prisma.tripStop.findMany()
    * ```
    */
  get tripStop(): Prisma.TripStopDelegate<ExtArgs>;

  /**
   * `prisma.notificationLog`: Exposes CRUD operations for the **NotificationLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more NotificationLogs
    * const notificationLogs = await prisma.notificationLog.findMany()
    * ```
    */
  get notificationLog(): Prisma.NotificationLogDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
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

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "user" | "bus" | "liveLocation" | "stop" | "school" | "admin" | "attendance" | "driver" | "conductor" | "emergency" | "student" | "route" | "routeStop" | "trip" | "tripStop" | "notificationLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Bus: {
        payload: Prisma.$BusPayload<ExtArgs>
        fields: Prisma.BusFieldRefs
        operations: {
          findUnique: {
            args: Prisma.BusFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.BusFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload>
          }
          findFirst: {
            args: Prisma.BusFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.BusFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload>
          }
          findMany: {
            args: Prisma.BusFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload>[]
          }
          create: {
            args: Prisma.BusCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload>
          }
          createMany: {
            args: Prisma.BusCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.BusCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload>[]
          }
          delete: {
            args: Prisma.BusDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload>
          }
          update: {
            args: Prisma.BusUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload>
          }
          deleteMany: {
            args: Prisma.BusDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.BusUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.BusUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$BusPayload>
          }
          aggregate: {
            args: Prisma.BusAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateBus>
          }
          groupBy: {
            args: Prisma.BusGroupByArgs<ExtArgs>
            result: $Utils.Optional<BusGroupByOutputType>[]
          }
          count: {
            args: Prisma.BusCountArgs<ExtArgs>
            result: $Utils.Optional<BusCountAggregateOutputType> | number
          }
        }
      }
      LiveLocation: {
        payload: Prisma.$LiveLocationPayload<ExtArgs>
        fields: Prisma.LiveLocationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.LiveLocationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.LiveLocationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload>
          }
          findFirst: {
            args: Prisma.LiveLocationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.LiveLocationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload>
          }
          findMany: {
            args: Prisma.LiveLocationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload>[]
          }
          create: {
            args: Prisma.LiveLocationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload>
          }
          createMany: {
            args: Prisma.LiveLocationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.LiveLocationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload>[]
          }
          delete: {
            args: Prisma.LiveLocationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload>
          }
          update: {
            args: Prisma.LiveLocationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload>
          }
          deleteMany: {
            args: Prisma.LiveLocationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.LiveLocationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.LiveLocationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$LiveLocationPayload>
          }
          aggregate: {
            args: Prisma.LiveLocationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateLiveLocation>
          }
          groupBy: {
            args: Prisma.LiveLocationGroupByArgs<ExtArgs>
            result: $Utils.Optional<LiveLocationGroupByOutputType>[]
          }
          count: {
            args: Prisma.LiveLocationCountArgs<ExtArgs>
            result: $Utils.Optional<LiveLocationCountAggregateOutputType> | number
          }
        }
      }
      Stop: {
        payload: Prisma.$StopPayload<ExtArgs>
        fields: Prisma.StopFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StopFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StopFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload>
          }
          findFirst: {
            args: Prisma.StopFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StopFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload>
          }
          findMany: {
            args: Prisma.StopFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload>[]
          }
          create: {
            args: Prisma.StopCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload>
          }
          createMany: {
            args: Prisma.StopCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StopCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload>[]
          }
          delete: {
            args: Prisma.StopDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload>
          }
          update: {
            args: Prisma.StopUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload>
          }
          deleteMany: {
            args: Prisma.StopDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StopUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StopUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StopPayload>
          }
          aggregate: {
            args: Prisma.StopAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStop>
          }
          groupBy: {
            args: Prisma.StopGroupByArgs<ExtArgs>
            result: $Utils.Optional<StopGroupByOutputType>[]
          }
          count: {
            args: Prisma.StopCountArgs<ExtArgs>
            result: $Utils.Optional<StopCountAggregateOutputType> | number
          }
        }
      }
      School: {
        payload: Prisma.$SchoolPayload<ExtArgs>
        fields: Prisma.SchoolFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SchoolFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SchoolFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          findFirst: {
            args: Prisma.SchoolFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SchoolFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          findMany: {
            args: Prisma.SchoolFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>[]
          }
          create: {
            args: Prisma.SchoolCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          createMany: {
            args: Prisma.SchoolCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SchoolCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>[]
          }
          delete: {
            args: Prisma.SchoolDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          update: {
            args: Prisma.SchoolUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          deleteMany: {
            args: Prisma.SchoolDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SchoolUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SchoolUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SchoolPayload>
          }
          aggregate: {
            args: Prisma.SchoolAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSchool>
          }
          groupBy: {
            args: Prisma.SchoolGroupByArgs<ExtArgs>
            result: $Utils.Optional<SchoolGroupByOutputType>[]
          }
          count: {
            args: Prisma.SchoolCountArgs<ExtArgs>
            result: $Utils.Optional<SchoolCountAggregateOutputType> | number
          }
        }
      }
      Admin: {
        payload: Prisma.$AdminPayload<ExtArgs>
        fields: Prisma.AdminFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AdminFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AdminFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          findFirst: {
            args: Prisma.AdminFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AdminFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          findMany: {
            args: Prisma.AdminFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>[]
          }
          create: {
            args: Prisma.AdminCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          createMany: {
            args: Prisma.AdminCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AdminCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>[]
          }
          delete: {
            args: Prisma.AdminDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          update: {
            args: Prisma.AdminUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          deleteMany: {
            args: Prisma.AdminDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AdminUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AdminUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AdminPayload>
          }
          aggregate: {
            args: Prisma.AdminAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAdmin>
          }
          groupBy: {
            args: Prisma.AdminGroupByArgs<ExtArgs>
            result: $Utils.Optional<AdminGroupByOutputType>[]
          }
          count: {
            args: Prisma.AdminCountArgs<ExtArgs>
            result: $Utils.Optional<AdminCountAggregateOutputType> | number
          }
        }
      }
      Attendance: {
        payload: Prisma.$AttendancePayload<ExtArgs>
        fields: Prisma.AttendanceFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttendanceFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttendanceFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findFirst: {
            args: Prisma.AttendanceFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttendanceFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          findMany: {
            args: Prisma.AttendanceFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          create: {
            args: Prisma.AttendanceCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          createMany: {
            args: Prisma.AttendanceCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AttendanceCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>[]
          }
          delete: {
            args: Prisma.AttendanceDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          update: {
            args: Prisma.AttendanceUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          deleteMany: {
            args: Prisma.AttendanceDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttendanceUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AttendanceUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttendancePayload>
          }
          aggregate: {
            args: Prisma.AttendanceAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttendance>
          }
          groupBy: {
            args: Prisma.AttendanceGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttendanceGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttendanceCountArgs<ExtArgs>
            result: $Utils.Optional<AttendanceCountAggregateOutputType> | number
          }
        }
      }
      Driver: {
        payload: Prisma.$DriverPayload<ExtArgs>
        fields: Prisma.DriverFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DriverFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DriverFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          findFirst: {
            args: Prisma.DriverFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DriverFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          findMany: {
            args: Prisma.DriverFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          create: {
            args: Prisma.DriverCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          createMany: {
            args: Prisma.DriverCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DriverCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>[]
          }
          delete: {
            args: Prisma.DriverDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          update: {
            args: Prisma.DriverUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          deleteMany: {
            args: Prisma.DriverDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DriverUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.DriverUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DriverPayload>
          }
          aggregate: {
            args: Prisma.DriverAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDriver>
          }
          groupBy: {
            args: Prisma.DriverGroupByArgs<ExtArgs>
            result: $Utils.Optional<DriverGroupByOutputType>[]
          }
          count: {
            args: Prisma.DriverCountArgs<ExtArgs>
            result: $Utils.Optional<DriverCountAggregateOutputType> | number
          }
        }
      }
      Conductor: {
        payload: Prisma.$ConductorPayload<ExtArgs>
        fields: Prisma.ConductorFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ConductorFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ConductorFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload>
          }
          findFirst: {
            args: Prisma.ConductorFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ConductorFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload>
          }
          findMany: {
            args: Prisma.ConductorFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload>[]
          }
          create: {
            args: Prisma.ConductorCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload>
          }
          createMany: {
            args: Prisma.ConductorCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ConductorCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload>[]
          }
          delete: {
            args: Prisma.ConductorDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload>
          }
          update: {
            args: Prisma.ConductorUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload>
          }
          deleteMany: {
            args: Prisma.ConductorDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ConductorUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ConductorUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ConductorPayload>
          }
          aggregate: {
            args: Prisma.ConductorAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateConductor>
          }
          groupBy: {
            args: Prisma.ConductorGroupByArgs<ExtArgs>
            result: $Utils.Optional<ConductorGroupByOutputType>[]
          }
          count: {
            args: Prisma.ConductorCountArgs<ExtArgs>
            result: $Utils.Optional<ConductorCountAggregateOutputType> | number
          }
        }
      }
      Emergency: {
        payload: Prisma.$EmergencyPayload<ExtArgs>
        fields: Prisma.EmergencyFieldRefs
        operations: {
          findUnique: {
            args: Prisma.EmergencyFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.EmergencyFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload>
          }
          findFirst: {
            args: Prisma.EmergencyFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.EmergencyFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload>
          }
          findMany: {
            args: Prisma.EmergencyFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload>[]
          }
          create: {
            args: Prisma.EmergencyCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload>
          }
          createMany: {
            args: Prisma.EmergencyCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.EmergencyCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload>[]
          }
          delete: {
            args: Prisma.EmergencyDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload>
          }
          update: {
            args: Prisma.EmergencyUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload>
          }
          deleteMany: {
            args: Prisma.EmergencyDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.EmergencyUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.EmergencyUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$EmergencyPayload>
          }
          aggregate: {
            args: Prisma.EmergencyAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateEmergency>
          }
          groupBy: {
            args: Prisma.EmergencyGroupByArgs<ExtArgs>
            result: $Utils.Optional<EmergencyGroupByOutputType>[]
          }
          count: {
            args: Prisma.EmergencyCountArgs<ExtArgs>
            result: $Utils.Optional<EmergencyCountAggregateOutputType> | number
          }
        }
      }
      Student: {
        payload: Prisma.$StudentPayload<ExtArgs>
        fields: Prisma.StudentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StudentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StudentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          findFirst: {
            args: Prisma.StudentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StudentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          findMany: {
            args: Prisma.StudentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[]
          }
          create: {
            args: Prisma.StudentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          createMany: {
            args: Prisma.StudentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StudentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>[]
          }
          delete: {
            args: Prisma.StudentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          update: {
            args: Prisma.StudentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          deleteMany: {
            args: Prisma.StudentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StudentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StudentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StudentPayload>
          }
          aggregate: {
            args: Prisma.StudentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStudent>
          }
          groupBy: {
            args: Prisma.StudentGroupByArgs<ExtArgs>
            result: $Utils.Optional<StudentGroupByOutputType>[]
          }
          count: {
            args: Prisma.StudentCountArgs<ExtArgs>
            result: $Utils.Optional<StudentCountAggregateOutputType> | number
          }
        }
      }
      Route: {
        payload: Prisma.$RoutePayload<ExtArgs>
        fields: Prisma.RouteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RouteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RouteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          findFirst: {
            args: Prisma.RouteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RouteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          findMany: {
            args: Prisma.RouteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>[]
          }
          create: {
            args: Prisma.RouteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          createMany: {
            args: Prisma.RouteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RouteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>[]
          }
          delete: {
            args: Prisma.RouteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          update: {
            args: Prisma.RouteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          deleteMany: {
            args: Prisma.RouteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RouteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RouteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RoutePayload>
          }
          aggregate: {
            args: Prisma.RouteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRoute>
          }
          groupBy: {
            args: Prisma.RouteGroupByArgs<ExtArgs>
            result: $Utils.Optional<RouteGroupByOutputType>[]
          }
          count: {
            args: Prisma.RouteCountArgs<ExtArgs>
            result: $Utils.Optional<RouteCountAggregateOutputType> | number
          }
        }
      }
      RouteStop: {
        payload: Prisma.$RouteStopPayload<ExtArgs>
        fields: Prisma.RouteStopFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RouteStopFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RouteStopFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload>
          }
          findFirst: {
            args: Prisma.RouteStopFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RouteStopFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload>
          }
          findMany: {
            args: Prisma.RouteStopFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload>[]
          }
          create: {
            args: Prisma.RouteStopCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload>
          }
          createMany: {
            args: Prisma.RouteStopCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RouteStopCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload>[]
          }
          delete: {
            args: Prisma.RouteStopDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload>
          }
          update: {
            args: Prisma.RouteStopUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload>
          }
          deleteMany: {
            args: Prisma.RouteStopDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RouteStopUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.RouteStopUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RouteStopPayload>
          }
          aggregate: {
            args: Prisma.RouteStopAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRouteStop>
          }
          groupBy: {
            args: Prisma.RouteStopGroupByArgs<ExtArgs>
            result: $Utils.Optional<RouteStopGroupByOutputType>[]
          }
          count: {
            args: Prisma.RouteStopCountArgs<ExtArgs>
            result: $Utils.Optional<RouteStopCountAggregateOutputType> | number
          }
        }
      }
      Trip: {
        payload: Prisma.$TripPayload<ExtArgs>
        fields: Prisma.TripFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TripFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TripFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload>
          }
          findFirst: {
            args: Prisma.TripFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TripFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload>
          }
          findMany: {
            args: Prisma.TripFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload>[]
          }
          create: {
            args: Prisma.TripCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload>
          }
          createMany: {
            args: Prisma.TripCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TripCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload>[]
          }
          delete: {
            args: Prisma.TripDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload>
          }
          update: {
            args: Prisma.TripUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload>
          }
          deleteMany: {
            args: Prisma.TripDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TripUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TripUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripPayload>
          }
          aggregate: {
            args: Prisma.TripAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTrip>
          }
          groupBy: {
            args: Prisma.TripGroupByArgs<ExtArgs>
            result: $Utils.Optional<TripGroupByOutputType>[]
          }
          count: {
            args: Prisma.TripCountArgs<ExtArgs>
            result: $Utils.Optional<TripCountAggregateOutputType> | number
          }
        }
      }
      TripStop: {
        payload: Prisma.$TripStopPayload<ExtArgs>
        fields: Prisma.TripStopFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TripStopFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TripStopFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload>
          }
          findFirst: {
            args: Prisma.TripStopFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TripStopFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload>
          }
          findMany: {
            args: Prisma.TripStopFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload>[]
          }
          create: {
            args: Prisma.TripStopCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload>
          }
          createMany: {
            args: Prisma.TripStopCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TripStopCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload>[]
          }
          delete: {
            args: Prisma.TripStopDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload>
          }
          update: {
            args: Prisma.TripStopUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload>
          }
          deleteMany: {
            args: Prisma.TripStopDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TripStopUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.TripStopUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TripStopPayload>
          }
          aggregate: {
            args: Prisma.TripStopAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTripStop>
          }
          groupBy: {
            args: Prisma.TripStopGroupByArgs<ExtArgs>
            result: $Utils.Optional<TripStopGroupByOutputType>[]
          }
          count: {
            args: Prisma.TripStopCountArgs<ExtArgs>
            result: $Utils.Optional<TripStopCountAggregateOutputType> | number
          }
        }
      }
      NotificationLog: {
        payload: Prisma.$NotificationLogPayload<ExtArgs>
        fields: Prisma.NotificationLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload>
          }
          findFirst: {
            args: Prisma.NotificationLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload>
          }
          findMany: {
            args: Prisma.NotificationLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload>[]
          }
          create: {
            args: Prisma.NotificationLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload>
          }
          createMany: {
            args: Prisma.NotificationLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload>[]
          }
          delete: {
            args: Prisma.NotificationLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload>
          }
          update: {
            args: Prisma.NotificationLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload>
          }
          deleteMany: {
            args: Prisma.NotificationLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.NotificationLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationLogPayload>
          }
          aggregate: {
            args: Prisma.NotificationLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotificationLog>
          }
          groupBy: {
            args: Prisma.NotificationLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationLogCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.DriverAdapter | null
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type RouteCountOutputType
   */

  export type RouteCountOutputType = {
    stops: number
  }

  export type RouteCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stops?: boolean | RouteCountOutputTypeCountStopsArgs
  }

  // Custom InputTypes
  /**
   * RouteCountOutputType without action
   */
  export type RouteCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteCountOutputType
     */
    select?: RouteCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * RouteCountOutputType without action
   */
  export type RouteCountOutputTypeCountStopsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RouteStopWhereInput
  }


  /**
   * Count Type TripCountOutputType
   */

  export type TripCountOutputType = {
    stops: number
  }

  export type TripCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stops?: boolean | TripCountOutputTypeCountStopsArgs
  }

  // Custom InputTypes
  /**
   * TripCountOutputType without action
   */
  export type TripCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripCountOutputType
     */
    select?: TripCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TripCountOutputType without action
   */
  export type TripCountOutputTypeCountStopsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TripStopWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    phone: string | null
    name: string | null
    role: $Enums.Role | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
    fcmToken: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    phone: string | null
    name: string | null
    role: $Enums.Role | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
    fcmToken: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    phone: number
    name: number
    role: number
    password: number
    createdAt: number
    updatedAt: number
    fcmToken: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    phone?: true
    name?: true
    role?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    fcmToken?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    phone?: true
    name?: true
    role?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    fcmToken?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    phone?: true
    name?: true
    role?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    fcmToken?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    phone: string
    name: string | null
    role: $Enums.Role
    password: string | null
    createdAt: Date
    updatedAt: Date
    fcmToken: string | null
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fcmToken?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    phone?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fcmToken?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    phone?: boolean
    name?: boolean
    role?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    fcmToken?: boolean
  }


  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      phone: string
      name: string | null
      role: $Enums.Role
      password: string | null
      createdAt: Date
      updatedAt: Date
      fcmToken: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */ 
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly password: FieldRef<"User", 'String'>
    readonly createdAt: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly fcmToken: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
  }


  /**
   * Model Bus
   */

  export type AggregateBus = {
    _count: BusCountAggregateOutputType | null
    _min: BusMinAggregateOutputType | null
    _max: BusMaxAggregateOutputType | null
  }

  export type BusMinAggregateOutputType = {
    id: string | null
    busNo: string | null
    driverName: string | null
    status: $Enums.BusStatus | null
    createdAt: Date | null
    label: string | null
  }

  export type BusMaxAggregateOutputType = {
    id: string | null
    busNo: string | null
    driverName: string | null
    status: $Enums.BusStatus | null
    createdAt: Date | null
    label: string | null
  }

  export type BusCountAggregateOutputType = {
    id: number
    busNo: number
    driverName: number
    status: number
    createdAt: number
    label: number
    _all: number
  }


  export type BusMinAggregateInputType = {
    id?: true
    busNo?: true
    driverName?: true
    status?: true
    createdAt?: true
    label?: true
  }

  export type BusMaxAggregateInputType = {
    id?: true
    busNo?: true
    driverName?: true
    status?: true
    createdAt?: true
    label?: true
  }

  export type BusCountAggregateInputType = {
    id?: true
    busNo?: true
    driverName?: true
    status?: true
    createdAt?: true
    label?: true
    _all?: true
  }

  export type BusAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Bus to aggregate.
     */
    where?: BusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Buses to fetch.
     */
    orderBy?: BusOrderByWithRelationInput | BusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: BusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Buses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Buses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Buses
    **/
    _count?: true | BusCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: BusMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: BusMaxAggregateInputType
  }

  export type GetBusAggregateType<T extends BusAggregateArgs> = {
        [P in keyof T & keyof AggregateBus]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateBus[P]>
      : GetScalarType<T[P], AggregateBus[P]>
  }




  export type BusGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: BusWhereInput
    orderBy?: BusOrderByWithAggregationInput | BusOrderByWithAggregationInput[]
    by: BusScalarFieldEnum[] | BusScalarFieldEnum
    having?: BusScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: BusCountAggregateInputType | true
    _min?: BusMinAggregateInputType
    _max?: BusMaxAggregateInputType
  }

  export type BusGroupByOutputType = {
    id: string
    busNo: string
    driverName: string
    status: $Enums.BusStatus
    createdAt: Date
    label: string | null
    _count: BusCountAggregateOutputType | null
    _min: BusMinAggregateOutputType | null
    _max: BusMaxAggregateOutputType | null
  }

  type GetBusGroupByPayload<T extends BusGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<BusGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof BusGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], BusGroupByOutputType[P]>
            : GetScalarType<T[P], BusGroupByOutputType[P]>
        }
      >
    >


  export type BusSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busNo?: boolean
    driverName?: boolean
    status?: boolean
    createdAt?: boolean
    label?: boolean
  }, ExtArgs["result"]["bus"]>

  export type BusSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busNo?: boolean
    driverName?: boolean
    status?: boolean
    createdAt?: boolean
    label?: boolean
  }, ExtArgs["result"]["bus"]>

  export type BusSelectScalar = {
    id?: boolean
    busNo?: boolean
    driverName?: boolean
    status?: boolean
    createdAt?: boolean
    label?: boolean
  }


  export type $BusPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Bus"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      busNo: string
      driverName: string
      status: $Enums.BusStatus
      createdAt: Date
      label: string | null
    }, ExtArgs["result"]["bus"]>
    composites: {}
  }

  type BusGetPayload<S extends boolean | null | undefined | BusDefaultArgs> = $Result.GetResult<Prisma.$BusPayload, S>

  type BusCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<BusFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: BusCountAggregateInputType | true
    }

  export interface BusDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Bus'], meta: { name: 'Bus' } }
    /**
     * Find zero or one Bus that matches the filter.
     * @param {BusFindUniqueArgs} args - Arguments to find a Bus
     * @example
     * // Get one Bus
     * const bus = await prisma.bus.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends BusFindUniqueArgs>(args: SelectSubset<T, BusFindUniqueArgs<ExtArgs>>): Prisma__BusClient<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Bus that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {BusFindUniqueOrThrowArgs} args - Arguments to find a Bus
     * @example
     * // Get one Bus
     * const bus = await prisma.bus.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends BusFindUniqueOrThrowArgs>(args: SelectSubset<T, BusFindUniqueOrThrowArgs<ExtArgs>>): Prisma__BusClient<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Bus that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusFindFirstArgs} args - Arguments to find a Bus
     * @example
     * // Get one Bus
     * const bus = await prisma.bus.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends BusFindFirstArgs>(args?: SelectSubset<T, BusFindFirstArgs<ExtArgs>>): Prisma__BusClient<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Bus that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusFindFirstOrThrowArgs} args - Arguments to find a Bus
     * @example
     * // Get one Bus
     * const bus = await prisma.bus.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends BusFindFirstOrThrowArgs>(args?: SelectSubset<T, BusFindFirstOrThrowArgs<ExtArgs>>): Prisma__BusClient<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Buses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Buses
     * const buses = await prisma.bus.findMany()
     * 
     * // Get first 10 Buses
     * const buses = await prisma.bus.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const busWithIdOnly = await prisma.bus.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends BusFindManyArgs>(args?: SelectSubset<T, BusFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Bus.
     * @param {BusCreateArgs} args - Arguments to create a Bus.
     * @example
     * // Create one Bus
     * const Bus = await prisma.bus.create({
     *   data: {
     *     // ... data to create a Bus
     *   }
     * })
     * 
     */
    create<T extends BusCreateArgs>(args: SelectSubset<T, BusCreateArgs<ExtArgs>>): Prisma__BusClient<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Buses.
     * @param {BusCreateManyArgs} args - Arguments to create many Buses.
     * @example
     * // Create many Buses
     * const bus = await prisma.bus.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends BusCreateManyArgs>(args?: SelectSubset<T, BusCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Buses and returns the data saved in the database.
     * @param {BusCreateManyAndReturnArgs} args - Arguments to create many Buses.
     * @example
     * // Create many Buses
     * const bus = await prisma.bus.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Buses and only return the `id`
     * const busWithIdOnly = await prisma.bus.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends BusCreateManyAndReturnArgs>(args?: SelectSubset<T, BusCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Bus.
     * @param {BusDeleteArgs} args - Arguments to delete one Bus.
     * @example
     * // Delete one Bus
     * const Bus = await prisma.bus.delete({
     *   where: {
     *     // ... filter to delete one Bus
     *   }
     * })
     * 
     */
    delete<T extends BusDeleteArgs>(args: SelectSubset<T, BusDeleteArgs<ExtArgs>>): Prisma__BusClient<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Bus.
     * @param {BusUpdateArgs} args - Arguments to update one Bus.
     * @example
     * // Update one Bus
     * const bus = await prisma.bus.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends BusUpdateArgs>(args: SelectSubset<T, BusUpdateArgs<ExtArgs>>): Prisma__BusClient<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Buses.
     * @param {BusDeleteManyArgs} args - Arguments to filter Buses to delete.
     * @example
     * // Delete a few Buses
     * const { count } = await prisma.bus.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends BusDeleteManyArgs>(args?: SelectSubset<T, BusDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Buses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Buses
     * const bus = await prisma.bus.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends BusUpdateManyArgs>(args: SelectSubset<T, BusUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Bus.
     * @param {BusUpsertArgs} args - Arguments to update or create a Bus.
     * @example
     * // Update or create a Bus
     * const bus = await prisma.bus.upsert({
     *   create: {
     *     // ... data to create a Bus
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Bus we want to update
     *   }
     * })
     */
    upsert<T extends BusUpsertArgs>(args: SelectSubset<T, BusUpsertArgs<ExtArgs>>): Prisma__BusClient<$Result.GetResult<Prisma.$BusPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Buses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusCountArgs} args - Arguments to filter Buses to count.
     * @example
     * // Count the number of Buses
     * const count = await prisma.bus.count({
     *   where: {
     *     // ... the filter for the Buses we want to count
     *   }
     * })
    **/
    count<T extends BusCountArgs>(
      args?: Subset<T, BusCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], BusCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Bus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends BusAggregateArgs>(args: Subset<T, BusAggregateArgs>): Prisma.PrismaPromise<GetBusAggregateType<T>>

    /**
     * Group by Bus.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {BusGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends BusGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: BusGroupByArgs['orderBy'] }
        : { orderBy?: BusGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, BusGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetBusGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Bus model
   */
  readonly fields: BusFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Bus.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__BusClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Bus model
   */ 
  interface BusFieldRefs {
    readonly id: FieldRef<"Bus", 'String'>
    readonly busNo: FieldRef<"Bus", 'String'>
    readonly driverName: FieldRef<"Bus", 'String'>
    readonly status: FieldRef<"Bus", 'BusStatus'>
    readonly createdAt: FieldRef<"Bus", 'DateTime'>
    readonly label: FieldRef<"Bus", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Bus findUnique
   */
  export type BusFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * Filter, which Bus to fetch.
     */
    where: BusWhereUniqueInput
  }

  /**
   * Bus findUniqueOrThrow
   */
  export type BusFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * Filter, which Bus to fetch.
     */
    where: BusWhereUniqueInput
  }

  /**
   * Bus findFirst
   */
  export type BusFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * Filter, which Bus to fetch.
     */
    where?: BusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Buses to fetch.
     */
    orderBy?: BusOrderByWithRelationInput | BusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Buses.
     */
    cursor?: BusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Buses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Buses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Buses.
     */
    distinct?: BusScalarFieldEnum | BusScalarFieldEnum[]
  }

  /**
   * Bus findFirstOrThrow
   */
  export type BusFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * Filter, which Bus to fetch.
     */
    where?: BusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Buses to fetch.
     */
    orderBy?: BusOrderByWithRelationInput | BusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Buses.
     */
    cursor?: BusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Buses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Buses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Buses.
     */
    distinct?: BusScalarFieldEnum | BusScalarFieldEnum[]
  }

  /**
   * Bus findMany
   */
  export type BusFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * Filter, which Buses to fetch.
     */
    where?: BusWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Buses to fetch.
     */
    orderBy?: BusOrderByWithRelationInput | BusOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Buses.
     */
    cursor?: BusWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Buses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Buses.
     */
    skip?: number
    distinct?: BusScalarFieldEnum | BusScalarFieldEnum[]
  }

  /**
   * Bus create
   */
  export type BusCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * The data needed to create a Bus.
     */
    data: XOR<BusCreateInput, BusUncheckedCreateInput>
  }

  /**
   * Bus createMany
   */
  export type BusCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Buses.
     */
    data: BusCreateManyInput | BusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bus createManyAndReturn
   */
  export type BusCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Buses.
     */
    data: BusCreateManyInput | BusCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Bus update
   */
  export type BusUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * The data needed to update a Bus.
     */
    data: XOR<BusUpdateInput, BusUncheckedUpdateInput>
    /**
     * Choose, which Bus to update.
     */
    where: BusWhereUniqueInput
  }

  /**
   * Bus updateMany
   */
  export type BusUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Buses.
     */
    data: XOR<BusUpdateManyMutationInput, BusUncheckedUpdateManyInput>
    /**
     * Filter which Buses to update
     */
    where?: BusWhereInput
  }

  /**
   * Bus upsert
   */
  export type BusUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * The filter to search for the Bus to update in case it exists.
     */
    where: BusWhereUniqueInput
    /**
     * In case the Bus found by the `where` argument doesn't exist, create a new Bus with this data.
     */
    create: XOR<BusCreateInput, BusUncheckedCreateInput>
    /**
     * In case the Bus was found with the provided `where` argument, update it with this data.
     */
    update: XOR<BusUpdateInput, BusUncheckedUpdateInput>
  }

  /**
   * Bus delete
   */
  export type BusDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
    /**
     * Filter which Bus to delete.
     */
    where: BusWhereUniqueInput
  }

  /**
   * Bus deleteMany
   */
  export type BusDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Buses to delete
     */
    where?: BusWhereInput
  }

  /**
   * Bus without action
   */
  export type BusDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Bus
     */
    select?: BusSelect<ExtArgs> | null
  }


  /**
   * Model LiveLocation
   */

  export type AggregateLiveLocation = {
    _count: LiveLocationCountAggregateOutputType | null
    _avg: LiveLocationAvgAggregateOutputType | null
    _sum: LiveLocationSumAggregateOutputType | null
    _min: LiveLocationMinAggregateOutputType | null
    _max: LiveLocationMaxAggregateOutputType | null
  }

  export type LiveLocationAvgAggregateOutputType = {
    lat: number | null
    lng: number | null
    speed: number | null
  }

  export type LiveLocationSumAggregateOutputType = {
    lat: number | null
    lng: number | null
    speed: number | null
  }

  export type LiveLocationMinAggregateOutputType = {
    id: string | null
    busId: string | null
    lat: number | null
    lng: number | null
    speed: number | null
    timestamp: Date | null
  }

  export type LiveLocationMaxAggregateOutputType = {
    id: string | null
    busId: string | null
    lat: number | null
    lng: number | null
    speed: number | null
    timestamp: Date | null
  }

  export type LiveLocationCountAggregateOutputType = {
    id: number
    busId: number
    lat: number
    lng: number
    speed: number
    timestamp: number
    _all: number
  }


  export type LiveLocationAvgAggregateInputType = {
    lat?: true
    lng?: true
    speed?: true
  }

  export type LiveLocationSumAggregateInputType = {
    lat?: true
    lng?: true
    speed?: true
  }

  export type LiveLocationMinAggregateInputType = {
    id?: true
    busId?: true
    lat?: true
    lng?: true
    speed?: true
    timestamp?: true
  }

  export type LiveLocationMaxAggregateInputType = {
    id?: true
    busId?: true
    lat?: true
    lng?: true
    speed?: true
    timestamp?: true
  }

  export type LiveLocationCountAggregateInputType = {
    id?: true
    busId?: true
    lat?: true
    lng?: true
    speed?: true
    timestamp?: true
    _all?: true
  }

  export type LiveLocationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LiveLocation to aggregate.
     */
    where?: LiveLocationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveLocations to fetch.
     */
    orderBy?: LiveLocationOrderByWithRelationInput | LiveLocationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: LiveLocationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveLocations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveLocations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned LiveLocations
    **/
    _count?: true | LiveLocationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LiveLocationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LiveLocationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LiveLocationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LiveLocationMaxAggregateInputType
  }

  export type GetLiveLocationAggregateType<T extends LiveLocationAggregateArgs> = {
        [P in keyof T & keyof AggregateLiveLocation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLiveLocation[P]>
      : GetScalarType<T[P], AggregateLiveLocation[P]>
  }




  export type LiveLocationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: LiveLocationWhereInput
    orderBy?: LiveLocationOrderByWithAggregationInput | LiveLocationOrderByWithAggregationInput[]
    by: LiveLocationScalarFieldEnum[] | LiveLocationScalarFieldEnum
    having?: LiveLocationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LiveLocationCountAggregateInputType | true
    _avg?: LiveLocationAvgAggregateInputType
    _sum?: LiveLocationSumAggregateInputType
    _min?: LiveLocationMinAggregateInputType
    _max?: LiveLocationMaxAggregateInputType
  }

  export type LiveLocationGroupByOutputType = {
    id: string
    busId: string
    lat: number
    lng: number
    speed: number
    timestamp: Date
    _count: LiveLocationCountAggregateOutputType | null
    _avg: LiveLocationAvgAggregateOutputType | null
    _sum: LiveLocationSumAggregateOutputType | null
    _min: LiveLocationMinAggregateOutputType | null
    _max: LiveLocationMaxAggregateOutputType | null
  }

  type GetLiveLocationGroupByPayload<T extends LiveLocationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<LiveLocationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LiveLocationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LiveLocationGroupByOutputType[P]>
            : GetScalarType<T[P], LiveLocationGroupByOutputType[P]>
        }
      >
    >


  export type LiveLocationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busId?: boolean
    lat?: boolean
    lng?: boolean
    speed?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["liveLocation"]>

  export type LiveLocationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busId?: boolean
    lat?: boolean
    lng?: boolean
    speed?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["liveLocation"]>

  export type LiveLocationSelectScalar = {
    id?: boolean
    busId?: boolean
    lat?: boolean
    lng?: boolean
    speed?: boolean
    timestamp?: boolean
  }


  export type $LiveLocationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "LiveLocation"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      busId: string
      lat: number
      lng: number
      speed: number
      timestamp: Date
    }, ExtArgs["result"]["liveLocation"]>
    composites: {}
  }

  type LiveLocationGetPayload<S extends boolean | null | undefined | LiveLocationDefaultArgs> = $Result.GetResult<Prisma.$LiveLocationPayload, S>

  type LiveLocationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<LiveLocationFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: LiveLocationCountAggregateInputType | true
    }

  export interface LiveLocationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['LiveLocation'], meta: { name: 'LiveLocation' } }
    /**
     * Find zero or one LiveLocation that matches the filter.
     * @param {LiveLocationFindUniqueArgs} args - Arguments to find a LiveLocation
     * @example
     * // Get one LiveLocation
     * const liveLocation = await prisma.liveLocation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends LiveLocationFindUniqueArgs>(args: SelectSubset<T, LiveLocationFindUniqueArgs<ExtArgs>>): Prisma__LiveLocationClient<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one LiveLocation that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {LiveLocationFindUniqueOrThrowArgs} args - Arguments to find a LiveLocation
     * @example
     * // Get one LiveLocation
     * const liveLocation = await prisma.liveLocation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends LiveLocationFindUniqueOrThrowArgs>(args: SelectSubset<T, LiveLocationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__LiveLocationClient<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first LiveLocation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveLocationFindFirstArgs} args - Arguments to find a LiveLocation
     * @example
     * // Get one LiveLocation
     * const liveLocation = await prisma.liveLocation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends LiveLocationFindFirstArgs>(args?: SelectSubset<T, LiveLocationFindFirstArgs<ExtArgs>>): Prisma__LiveLocationClient<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first LiveLocation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveLocationFindFirstOrThrowArgs} args - Arguments to find a LiveLocation
     * @example
     * // Get one LiveLocation
     * const liveLocation = await prisma.liveLocation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends LiveLocationFindFirstOrThrowArgs>(args?: SelectSubset<T, LiveLocationFindFirstOrThrowArgs<ExtArgs>>): Prisma__LiveLocationClient<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more LiveLocations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveLocationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all LiveLocations
     * const liveLocations = await prisma.liveLocation.findMany()
     * 
     * // Get first 10 LiveLocations
     * const liveLocations = await prisma.liveLocation.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const liveLocationWithIdOnly = await prisma.liveLocation.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends LiveLocationFindManyArgs>(args?: SelectSubset<T, LiveLocationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a LiveLocation.
     * @param {LiveLocationCreateArgs} args - Arguments to create a LiveLocation.
     * @example
     * // Create one LiveLocation
     * const LiveLocation = await prisma.liveLocation.create({
     *   data: {
     *     // ... data to create a LiveLocation
     *   }
     * })
     * 
     */
    create<T extends LiveLocationCreateArgs>(args: SelectSubset<T, LiveLocationCreateArgs<ExtArgs>>): Prisma__LiveLocationClient<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many LiveLocations.
     * @param {LiveLocationCreateManyArgs} args - Arguments to create many LiveLocations.
     * @example
     * // Create many LiveLocations
     * const liveLocation = await prisma.liveLocation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends LiveLocationCreateManyArgs>(args?: SelectSubset<T, LiveLocationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many LiveLocations and returns the data saved in the database.
     * @param {LiveLocationCreateManyAndReturnArgs} args - Arguments to create many LiveLocations.
     * @example
     * // Create many LiveLocations
     * const liveLocation = await prisma.liveLocation.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many LiveLocations and only return the `id`
     * const liveLocationWithIdOnly = await prisma.liveLocation.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends LiveLocationCreateManyAndReturnArgs>(args?: SelectSubset<T, LiveLocationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a LiveLocation.
     * @param {LiveLocationDeleteArgs} args - Arguments to delete one LiveLocation.
     * @example
     * // Delete one LiveLocation
     * const LiveLocation = await prisma.liveLocation.delete({
     *   where: {
     *     // ... filter to delete one LiveLocation
     *   }
     * })
     * 
     */
    delete<T extends LiveLocationDeleteArgs>(args: SelectSubset<T, LiveLocationDeleteArgs<ExtArgs>>): Prisma__LiveLocationClient<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one LiveLocation.
     * @param {LiveLocationUpdateArgs} args - Arguments to update one LiveLocation.
     * @example
     * // Update one LiveLocation
     * const liveLocation = await prisma.liveLocation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends LiveLocationUpdateArgs>(args: SelectSubset<T, LiveLocationUpdateArgs<ExtArgs>>): Prisma__LiveLocationClient<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more LiveLocations.
     * @param {LiveLocationDeleteManyArgs} args - Arguments to filter LiveLocations to delete.
     * @example
     * // Delete a few LiveLocations
     * const { count } = await prisma.liveLocation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends LiveLocationDeleteManyArgs>(args?: SelectSubset<T, LiveLocationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more LiveLocations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveLocationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many LiveLocations
     * const liveLocation = await prisma.liveLocation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends LiveLocationUpdateManyArgs>(args: SelectSubset<T, LiveLocationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one LiveLocation.
     * @param {LiveLocationUpsertArgs} args - Arguments to update or create a LiveLocation.
     * @example
     * // Update or create a LiveLocation
     * const liveLocation = await prisma.liveLocation.upsert({
     *   create: {
     *     // ... data to create a LiveLocation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the LiveLocation we want to update
     *   }
     * })
     */
    upsert<T extends LiveLocationUpsertArgs>(args: SelectSubset<T, LiveLocationUpsertArgs<ExtArgs>>): Prisma__LiveLocationClient<$Result.GetResult<Prisma.$LiveLocationPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of LiveLocations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveLocationCountArgs} args - Arguments to filter LiveLocations to count.
     * @example
     * // Count the number of LiveLocations
     * const count = await prisma.liveLocation.count({
     *   where: {
     *     // ... the filter for the LiveLocations we want to count
     *   }
     * })
    **/
    count<T extends LiveLocationCountArgs>(
      args?: Subset<T, LiveLocationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LiveLocationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a LiveLocation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveLocationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LiveLocationAggregateArgs>(args: Subset<T, LiveLocationAggregateArgs>): Prisma.PrismaPromise<GetLiveLocationAggregateType<T>>

    /**
     * Group by LiveLocation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LiveLocationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LiveLocationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LiveLocationGroupByArgs['orderBy'] }
        : { orderBy?: LiveLocationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LiveLocationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLiveLocationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the LiveLocation model
   */
  readonly fields: LiveLocationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for LiveLocation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__LiveLocationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the LiveLocation model
   */ 
  interface LiveLocationFieldRefs {
    readonly id: FieldRef<"LiveLocation", 'String'>
    readonly busId: FieldRef<"LiveLocation", 'String'>
    readonly lat: FieldRef<"LiveLocation", 'Float'>
    readonly lng: FieldRef<"LiveLocation", 'Float'>
    readonly speed: FieldRef<"LiveLocation", 'Float'>
    readonly timestamp: FieldRef<"LiveLocation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * LiveLocation findUnique
   */
  export type LiveLocationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * Filter, which LiveLocation to fetch.
     */
    where: LiveLocationWhereUniqueInput
  }

  /**
   * LiveLocation findUniqueOrThrow
   */
  export type LiveLocationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * Filter, which LiveLocation to fetch.
     */
    where: LiveLocationWhereUniqueInput
  }

  /**
   * LiveLocation findFirst
   */
  export type LiveLocationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * Filter, which LiveLocation to fetch.
     */
    where?: LiveLocationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveLocations to fetch.
     */
    orderBy?: LiveLocationOrderByWithRelationInput | LiveLocationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LiveLocations.
     */
    cursor?: LiveLocationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveLocations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveLocations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LiveLocations.
     */
    distinct?: LiveLocationScalarFieldEnum | LiveLocationScalarFieldEnum[]
  }

  /**
   * LiveLocation findFirstOrThrow
   */
  export type LiveLocationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * Filter, which LiveLocation to fetch.
     */
    where?: LiveLocationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveLocations to fetch.
     */
    orderBy?: LiveLocationOrderByWithRelationInput | LiveLocationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for LiveLocations.
     */
    cursor?: LiveLocationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveLocations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveLocations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of LiveLocations.
     */
    distinct?: LiveLocationScalarFieldEnum | LiveLocationScalarFieldEnum[]
  }

  /**
   * LiveLocation findMany
   */
  export type LiveLocationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * Filter, which LiveLocations to fetch.
     */
    where?: LiveLocationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of LiveLocations to fetch.
     */
    orderBy?: LiveLocationOrderByWithRelationInput | LiveLocationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing LiveLocations.
     */
    cursor?: LiveLocationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` LiveLocations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` LiveLocations.
     */
    skip?: number
    distinct?: LiveLocationScalarFieldEnum | LiveLocationScalarFieldEnum[]
  }

  /**
   * LiveLocation create
   */
  export type LiveLocationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * The data needed to create a LiveLocation.
     */
    data: XOR<LiveLocationCreateInput, LiveLocationUncheckedCreateInput>
  }

  /**
   * LiveLocation createMany
   */
  export type LiveLocationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many LiveLocations.
     */
    data: LiveLocationCreateManyInput | LiveLocationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LiveLocation createManyAndReturn
   */
  export type LiveLocationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many LiveLocations.
     */
    data: LiveLocationCreateManyInput | LiveLocationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * LiveLocation update
   */
  export type LiveLocationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * The data needed to update a LiveLocation.
     */
    data: XOR<LiveLocationUpdateInput, LiveLocationUncheckedUpdateInput>
    /**
     * Choose, which LiveLocation to update.
     */
    where: LiveLocationWhereUniqueInput
  }

  /**
   * LiveLocation updateMany
   */
  export type LiveLocationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update LiveLocations.
     */
    data: XOR<LiveLocationUpdateManyMutationInput, LiveLocationUncheckedUpdateManyInput>
    /**
     * Filter which LiveLocations to update
     */
    where?: LiveLocationWhereInput
  }

  /**
   * LiveLocation upsert
   */
  export type LiveLocationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * The filter to search for the LiveLocation to update in case it exists.
     */
    where: LiveLocationWhereUniqueInput
    /**
     * In case the LiveLocation found by the `where` argument doesn't exist, create a new LiveLocation with this data.
     */
    create: XOR<LiveLocationCreateInput, LiveLocationUncheckedCreateInput>
    /**
     * In case the LiveLocation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<LiveLocationUpdateInput, LiveLocationUncheckedUpdateInput>
  }

  /**
   * LiveLocation delete
   */
  export type LiveLocationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
    /**
     * Filter which LiveLocation to delete.
     */
    where: LiveLocationWhereUniqueInput
  }

  /**
   * LiveLocation deleteMany
   */
  export type LiveLocationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which LiveLocations to delete
     */
    where?: LiveLocationWhereInput
  }

  /**
   * LiveLocation without action
   */
  export type LiveLocationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the LiveLocation
     */
    select?: LiveLocationSelect<ExtArgs> | null
  }


  /**
   * Model Stop
   */

  export type AggregateStop = {
    _count: StopCountAggregateOutputType | null
    _avg: StopAvgAggregateOutputType | null
    _sum: StopSumAggregateOutputType | null
    _min: StopMinAggregateOutputType | null
    _max: StopMaxAggregateOutputType | null
  }

  export type StopAvgAggregateOutputType = {
    lat: number | null
    lng: number | null
    order: number | null
  }

  export type StopSumAggregateOutputType = {
    lat: number | null
    lng: number | null
    order: number | null
  }

  export type StopMinAggregateOutputType = {
    id: string | null
    name: string | null
    lat: number | null
    lng: number | null
    busId: string | null
    order: number | null
    needsLocation: boolean | null
    direction: $Enums.TripDirection | null
    studentId: string | null
  }

  export type StopMaxAggregateOutputType = {
    id: string | null
    name: string | null
    lat: number | null
    lng: number | null
    busId: string | null
    order: number | null
    needsLocation: boolean | null
    direction: $Enums.TripDirection | null
    studentId: string | null
  }

  export type StopCountAggregateOutputType = {
    id: number
    name: number
    lat: number
    lng: number
    busId: number
    order: number
    needsLocation: number
    direction: number
    studentId: number
    _all: number
  }


  export type StopAvgAggregateInputType = {
    lat?: true
    lng?: true
    order?: true
  }

  export type StopSumAggregateInputType = {
    lat?: true
    lng?: true
    order?: true
  }

  export type StopMinAggregateInputType = {
    id?: true
    name?: true
    lat?: true
    lng?: true
    busId?: true
    order?: true
    needsLocation?: true
    direction?: true
    studentId?: true
  }

  export type StopMaxAggregateInputType = {
    id?: true
    name?: true
    lat?: true
    lng?: true
    busId?: true
    order?: true
    needsLocation?: true
    direction?: true
    studentId?: true
  }

  export type StopCountAggregateInputType = {
    id?: true
    name?: true
    lat?: true
    lng?: true
    busId?: true
    order?: true
    needsLocation?: true
    direction?: true
    studentId?: true
    _all?: true
  }

  export type StopAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stop to aggregate.
     */
    where?: StopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stops to fetch.
     */
    orderBy?: StopOrderByWithRelationInput | StopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Stops
    **/
    _count?: true | StopCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StopAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StopSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StopMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StopMaxAggregateInputType
  }

  export type GetStopAggregateType<T extends StopAggregateArgs> = {
        [P in keyof T & keyof AggregateStop]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStop[P]>
      : GetScalarType<T[P], AggregateStop[P]>
  }




  export type StopGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StopWhereInput
    orderBy?: StopOrderByWithAggregationInput | StopOrderByWithAggregationInput[]
    by: StopScalarFieldEnum[] | StopScalarFieldEnum
    having?: StopScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StopCountAggregateInputType | true
    _avg?: StopAvgAggregateInputType
    _sum?: StopSumAggregateInputType
    _min?: StopMinAggregateInputType
    _max?: StopMaxAggregateInputType
  }

  export type StopGroupByOutputType = {
    id: string
    name: string
    lat: number
    lng: number
    busId: string
    order: number
    needsLocation: boolean
    direction: $Enums.TripDirection
    studentId: string | null
    _count: StopCountAggregateOutputType | null
    _avg: StopAvgAggregateOutputType | null
    _sum: StopSumAggregateOutputType | null
    _min: StopMinAggregateOutputType | null
    _max: StopMaxAggregateOutputType | null
  }

  type GetStopGroupByPayload<T extends StopGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StopGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StopGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StopGroupByOutputType[P]>
            : GetScalarType<T[P], StopGroupByOutputType[P]>
        }
      >
    >


  export type StopSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    busId?: boolean
    order?: boolean
    needsLocation?: boolean
    direction?: boolean
    studentId?: boolean
  }, ExtArgs["result"]["stop"]>

  export type StopSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    busId?: boolean
    order?: boolean
    needsLocation?: boolean
    direction?: boolean
    studentId?: boolean
  }, ExtArgs["result"]["stop"]>

  export type StopSelectScalar = {
    id?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    busId?: boolean
    order?: boolean
    needsLocation?: boolean
    direction?: boolean
    studentId?: boolean
  }


  export type $StopPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Stop"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      lat: number
      lng: number
      busId: string
      order: number
      needsLocation: boolean
      direction: $Enums.TripDirection
      studentId: string | null
    }, ExtArgs["result"]["stop"]>
    composites: {}
  }

  type StopGetPayload<S extends boolean | null | undefined | StopDefaultArgs> = $Result.GetResult<Prisma.$StopPayload, S>

  type StopCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StopFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StopCountAggregateInputType | true
    }

  export interface StopDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Stop'], meta: { name: 'Stop' } }
    /**
     * Find zero or one Stop that matches the filter.
     * @param {StopFindUniqueArgs} args - Arguments to find a Stop
     * @example
     * // Get one Stop
     * const stop = await prisma.stop.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StopFindUniqueArgs>(args: SelectSubset<T, StopFindUniqueArgs<ExtArgs>>): Prisma__StopClient<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Stop that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StopFindUniqueOrThrowArgs} args - Arguments to find a Stop
     * @example
     * // Get one Stop
     * const stop = await prisma.stop.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StopFindUniqueOrThrowArgs>(args: SelectSubset<T, StopFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StopClient<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Stop that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StopFindFirstArgs} args - Arguments to find a Stop
     * @example
     * // Get one Stop
     * const stop = await prisma.stop.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StopFindFirstArgs>(args?: SelectSubset<T, StopFindFirstArgs<ExtArgs>>): Prisma__StopClient<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Stop that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StopFindFirstOrThrowArgs} args - Arguments to find a Stop
     * @example
     * // Get one Stop
     * const stop = await prisma.stop.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StopFindFirstOrThrowArgs>(args?: SelectSubset<T, StopFindFirstOrThrowArgs<ExtArgs>>): Prisma__StopClient<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Stops that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StopFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Stops
     * const stops = await prisma.stop.findMany()
     * 
     * // Get first 10 Stops
     * const stops = await prisma.stop.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const stopWithIdOnly = await prisma.stop.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StopFindManyArgs>(args?: SelectSubset<T, StopFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Stop.
     * @param {StopCreateArgs} args - Arguments to create a Stop.
     * @example
     * // Create one Stop
     * const Stop = await prisma.stop.create({
     *   data: {
     *     // ... data to create a Stop
     *   }
     * })
     * 
     */
    create<T extends StopCreateArgs>(args: SelectSubset<T, StopCreateArgs<ExtArgs>>): Prisma__StopClient<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Stops.
     * @param {StopCreateManyArgs} args - Arguments to create many Stops.
     * @example
     * // Create many Stops
     * const stop = await prisma.stop.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StopCreateManyArgs>(args?: SelectSubset<T, StopCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Stops and returns the data saved in the database.
     * @param {StopCreateManyAndReturnArgs} args - Arguments to create many Stops.
     * @example
     * // Create many Stops
     * const stop = await prisma.stop.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Stops and only return the `id`
     * const stopWithIdOnly = await prisma.stop.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StopCreateManyAndReturnArgs>(args?: SelectSubset<T, StopCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Stop.
     * @param {StopDeleteArgs} args - Arguments to delete one Stop.
     * @example
     * // Delete one Stop
     * const Stop = await prisma.stop.delete({
     *   where: {
     *     // ... filter to delete one Stop
     *   }
     * })
     * 
     */
    delete<T extends StopDeleteArgs>(args: SelectSubset<T, StopDeleteArgs<ExtArgs>>): Prisma__StopClient<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Stop.
     * @param {StopUpdateArgs} args - Arguments to update one Stop.
     * @example
     * // Update one Stop
     * const stop = await prisma.stop.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StopUpdateArgs>(args: SelectSubset<T, StopUpdateArgs<ExtArgs>>): Prisma__StopClient<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Stops.
     * @param {StopDeleteManyArgs} args - Arguments to filter Stops to delete.
     * @example
     * // Delete a few Stops
     * const { count } = await prisma.stop.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StopDeleteManyArgs>(args?: SelectSubset<T, StopDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Stops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StopUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Stops
     * const stop = await prisma.stop.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StopUpdateManyArgs>(args: SelectSubset<T, StopUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Stop.
     * @param {StopUpsertArgs} args - Arguments to update or create a Stop.
     * @example
     * // Update or create a Stop
     * const stop = await prisma.stop.upsert({
     *   create: {
     *     // ... data to create a Stop
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Stop we want to update
     *   }
     * })
     */
    upsert<T extends StopUpsertArgs>(args: SelectSubset<T, StopUpsertArgs<ExtArgs>>): Prisma__StopClient<$Result.GetResult<Prisma.$StopPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Stops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StopCountArgs} args - Arguments to filter Stops to count.
     * @example
     * // Count the number of Stops
     * const count = await prisma.stop.count({
     *   where: {
     *     // ... the filter for the Stops we want to count
     *   }
     * })
    **/
    count<T extends StopCountArgs>(
      args?: Subset<T, StopCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StopCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Stop.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StopAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StopAggregateArgs>(args: Subset<T, StopAggregateArgs>): Prisma.PrismaPromise<GetStopAggregateType<T>>

    /**
     * Group by Stop.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StopGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StopGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StopGroupByArgs['orderBy'] }
        : { orderBy?: StopGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StopGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStopGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Stop model
   */
  readonly fields: StopFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Stop.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StopClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Stop model
   */ 
  interface StopFieldRefs {
    readonly id: FieldRef<"Stop", 'String'>
    readonly name: FieldRef<"Stop", 'String'>
    readonly lat: FieldRef<"Stop", 'Float'>
    readonly lng: FieldRef<"Stop", 'Float'>
    readonly busId: FieldRef<"Stop", 'String'>
    readonly order: FieldRef<"Stop", 'Int'>
    readonly needsLocation: FieldRef<"Stop", 'Boolean'>
    readonly direction: FieldRef<"Stop", 'TripDirection'>
    readonly studentId: FieldRef<"Stop", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Stop findUnique
   */
  export type StopFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * Filter, which Stop to fetch.
     */
    where: StopWhereUniqueInput
  }

  /**
   * Stop findUniqueOrThrow
   */
  export type StopFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * Filter, which Stop to fetch.
     */
    where: StopWhereUniqueInput
  }

  /**
   * Stop findFirst
   */
  export type StopFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * Filter, which Stop to fetch.
     */
    where?: StopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stops to fetch.
     */
    orderBy?: StopOrderByWithRelationInput | StopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stops.
     */
    cursor?: StopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stops.
     */
    distinct?: StopScalarFieldEnum | StopScalarFieldEnum[]
  }

  /**
   * Stop findFirstOrThrow
   */
  export type StopFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * Filter, which Stop to fetch.
     */
    where?: StopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stops to fetch.
     */
    orderBy?: StopOrderByWithRelationInput | StopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Stops.
     */
    cursor?: StopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Stops.
     */
    distinct?: StopScalarFieldEnum | StopScalarFieldEnum[]
  }

  /**
   * Stop findMany
   */
  export type StopFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * Filter, which Stops to fetch.
     */
    where?: StopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Stops to fetch.
     */
    orderBy?: StopOrderByWithRelationInput | StopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Stops.
     */
    cursor?: StopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Stops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Stops.
     */
    skip?: number
    distinct?: StopScalarFieldEnum | StopScalarFieldEnum[]
  }

  /**
   * Stop create
   */
  export type StopCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * The data needed to create a Stop.
     */
    data: XOR<StopCreateInput, StopUncheckedCreateInput>
  }

  /**
   * Stop createMany
   */
  export type StopCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Stops.
     */
    data: StopCreateManyInput | StopCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Stop createManyAndReturn
   */
  export type StopCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Stops.
     */
    data: StopCreateManyInput | StopCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Stop update
   */
  export type StopUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * The data needed to update a Stop.
     */
    data: XOR<StopUpdateInput, StopUncheckedUpdateInput>
    /**
     * Choose, which Stop to update.
     */
    where: StopWhereUniqueInput
  }

  /**
   * Stop updateMany
   */
  export type StopUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Stops.
     */
    data: XOR<StopUpdateManyMutationInput, StopUncheckedUpdateManyInput>
    /**
     * Filter which Stops to update
     */
    where?: StopWhereInput
  }

  /**
   * Stop upsert
   */
  export type StopUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * The filter to search for the Stop to update in case it exists.
     */
    where: StopWhereUniqueInput
    /**
     * In case the Stop found by the `where` argument doesn't exist, create a new Stop with this data.
     */
    create: XOR<StopCreateInput, StopUncheckedCreateInput>
    /**
     * In case the Stop was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StopUpdateInput, StopUncheckedUpdateInput>
  }

  /**
   * Stop delete
   */
  export type StopDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
    /**
     * Filter which Stop to delete.
     */
    where: StopWhereUniqueInput
  }

  /**
   * Stop deleteMany
   */
  export type StopDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Stops to delete
     */
    where?: StopWhereInput
  }

  /**
   * Stop without action
   */
  export type StopDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Stop
     */
    select?: StopSelect<ExtArgs> | null
  }


  /**
   * Model School
   */

  export type AggregateSchool = {
    _count: SchoolCountAggregateOutputType | null
    _avg: SchoolAvgAggregateOutputType | null
    _sum: SchoolSumAggregateOutputType | null
    _min: SchoolMinAggregateOutputType | null
    _max: SchoolMaxAggregateOutputType | null
  }

  export type SchoolAvgAggregateOutputType = {
    lat: number | null
    lng: number | null
  }

  export type SchoolSumAggregateOutputType = {
    lat: number | null
    lng: number | null
  }

  export type SchoolMinAggregateOutputType = {
    id: string | null
    name: string | null
    address: string | null
    lat: number | null
    lng: number | null
    updatedAt: Date | null
    contactPhone: string | null
  }

  export type SchoolMaxAggregateOutputType = {
    id: string | null
    name: string | null
    address: string | null
    lat: number | null
    lng: number | null
    updatedAt: Date | null
    contactPhone: string | null
  }

  export type SchoolCountAggregateOutputType = {
    id: number
    name: number
    address: number
    lat: number
    lng: number
    updatedAt: number
    contactPhone: number
    _all: number
  }


  export type SchoolAvgAggregateInputType = {
    lat?: true
    lng?: true
  }

  export type SchoolSumAggregateInputType = {
    lat?: true
    lng?: true
  }

  export type SchoolMinAggregateInputType = {
    id?: true
    name?: true
    address?: true
    lat?: true
    lng?: true
    updatedAt?: true
    contactPhone?: true
  }

  export type SchoolMaxAggregateInputType = {
    id?: true
    name?: true
    address?: true
    lat?: true
    lng?: true
    updatedAt?: true
    contactPhone?: true
  }

  export type SchoolCountAggregateInputType = {
    id?: true
    name?: true
    address?: true
    lat?: true
    lng?: true
    updatedAt?: true
    contactPhone?: true
    _all?: true
  }

  export type SchoolAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which School to aggregate.
     */
    where?: SchoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schools to fetch.
     */
    orderBy?: SchoolOrderByWithRelationInput | SchoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SchoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Schools
    **/
    _count?: true | SchoolCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SchoolAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SchoolSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SchoolMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SchoolMaxAggregateInputType
  }

  export type GetSchoolAggregateType<T extends SchoolAggregateArgs> = {
        [P in keyof T & keyof AggregateSchool]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSchool[P]>
      : GetScalarType<T[P], AggregateSchool[P]>
  }




  export type SchoolGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SchoolWhereInput
    orderBy?: SchoolOrderByWithAggregationInput | SchoolOrderByWithAggregationInput[]
    by: SchoolScalarFieldEnum[] | SchoolScalarFieldEnum
    having?: SchoolScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SchoolCountAggregateInputType | true
    _avg?: SchoolAvgAggregateInputType
    _sum?: SchoolSumAggregateInputType
    _min?: SchoolMinAggregateInputType
    _max?: SchoolMaxAggregateInputType
  }

  export type SchoolGroupByOutputType = {
    id: string
    name: string
    address: string | null
    lat: number
    lng: number
    updatedAt: Date
    contactPhone: string | null
    _count: SchoolCountAggregateOutputType | null
    _avg: SchoolAvgAggregateOutputType | null
    _sum: SchoolSumAggregateOutputType | null
    _min: SchoolMinAggregateOutputType | null
    _max: SchoolMaxAggregateOutputType | null
  }

  type GetSchoolGroupByPayload<T extends SchoolGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SchoolGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SchoolGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SchoolGroupByOutputType[P]>
            : GetScalarType<T[P], SchoolGroupByOutputType[P]>
        }
      >
    >


  export type SchoolSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    lat?: boolean
    lng?: boolean
    updatedAt?: boolean
    contactPhone?: boolean
  }, ExtArgs["result"]["school"]>

  export type SchoolSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    address?: boolean
    lat?: boolean
    lng?: boolean
    updatedAt?: boolean
    contactPhone?: boolean
  }, ExtArgs["result"]["school"]>

  export type SchoolSelectScalar = {
    id?: boolean
    name?: boolean
    address?: boolean
    lat?: boolean
    lng?: boolean
    updatedAt?: boolean
    contactPhone?: boolean
  }


  export type $SchoolPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "School"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      address: string | null
      lat: number
      lng: number
      updatedAt: Date
      contactPhone: string | null
    }, ExtArgs["result"]["school"]>
    composites: {}
  }

  type SchoolGetPayload<S extends boolean | null | undefined | SchoolDefaultArgs> = $Result.GetResult<Prisma.$SchoolPayload, S>

  type SchoolCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SchoolFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SchoolCountAggregateInputType | true
    }

  export interface SchoolDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['School'], meta: { name: 'School' } }
    /**
     * Find zero or one School that matches the filter.
     * @param {SchoolFindUniqueArgs} args - Arguments to find a School
     * @example
     * // Get one School
     * const school = await prisma.school.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SchoolFindUniqueArgs>(args: SelectSubset<T, SchoolFindUniqueArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one School that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SchoolFindUniqueOrThrowArgs} args - Arguments to find a School
     * @example
     * // Get one School
     * const school = await prisma.school.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SchoolFindUniqueOrThrowArgs>(args: SelectSubset<T, SchoolFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first School that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolFindFirstArgs} args - Arguments to find a School
     * @example
     * // Get one School
     * const school = await prisma.school.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SchoolFindFirstArgs>(args?: SelectSubset<T, SchoolFindFirstArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first School that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolFindFirstOrThrowArgs} args - Arguments to find a School
     * @example
     * // Get one School
     * const school = await prisma.school.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SchoolFindFirstOrThrowArgs>(args?: SelectSubset<T, SchoolFindFirstOrThrowArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Schools that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Schools
     * const schools = await prisma.school.findMany()
     * 
     * // Get first 10 Schools
     * const schools = await prisma.school.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const schoolWithIdOnly = await prisma.school.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SchoolFindManyArgs>(args?: SelectSubset<T, SchoolFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a School.
     * @param {SchoolCreateArgs} args - Arguments to create a School.
     * @example
     * // Create one School
     * const School = await prisma.school.create({
     *   data: {
     *     // ... data to create a School
     *   }
     * })
     * 
     */
    create<T extends SchoolCreateArgs>(args: SelectSubset<T, SchoolCreateArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Schools.
     * @param {SchoolCreateManyArgs} args - Arguments to create many Schools.
     * @example
     * // Create many Schools
     * const school = await prisma.school.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SchoolCreateManyArgs>(args?: SelectSubset<T, SchoolCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Schools and returns the data saved in the database.
     * @param {SchoolCreateManyAndReturnArgs} args - Arguments to create many Schools.
     * @example
     * // Create many Schools
     * const school = await prisma.school.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Schools and only return the `id`
     * const schoolWithIdOnly = await prisma.school.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SchoolCreateManyAndReturnArgs>(args?: SelectSubset<T, SchoolCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a School.
     * @param {SchoolDeleteArgs} args - Arguments to delete one School.
     * @example
     * // Delete one School
     * const School = await prisma.school.delete({
     *   where: {
     *     // ... filter to delete one School
     *   }
     * })
     * 
     */
    delete<T extends SchoolDeleteArgs>(args: SelectSubset<T, SchoolDeleteArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one School.
     * @param {SchoolUpdateArgs} args - Arguments to update one School.
     * @example
     * // Update one School
     * const school = await prisma.school.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SchoolUpdateArgs>(args: SelectSubset<T, SchoolUpdateArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Schools.
     * @param {SchoolDeleteManyArgs} args - Arguments to filter Schools to delete.
     * @example
     * // Delete a few Schools
     * const { count } = await prisma.school.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SchoolDeleteManyArgs>(args?: SelectSubset<T, SchoolDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Schools.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Schools
     * const school = await prisma.school.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SchoolUpdateManyArgs>(args: SelectSubset<T, SchoolUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one School.
     * @param {SchoolUpsertArgs} args - Arguments to update or create a School.
     * @example
     * // Update or create a School
     * const school = await prisma.school.upsert({
     *   create: {
     *     // ... data to create a School
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the School we want to update
     *   }
     * })
     */
    upsert<T extends SchoolUpsertArgs>(args: SelectSubset<T, SchoolUpsertArgs<ExtArgs>>): Prisma__SchoolClient<$Result.GetResult<Prisma.$SchoolPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Schools.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolCountArgs} args - Arguments to filter Schools to count.
     * @example
     * // Count the number of Schools
     * const count = await prisma.school.count({
     *   where: {
     *     // ... the filter for the Schools we want to count
     *   }
     * })
    **/
    count<T extends SchoolCountArgs>(
      args?: Subset<T, SchoolCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SchoolCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a School.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SchoolAggregateArgs>(args: Subset<T, SchoolAggregateArgs>): Prisma.PrismaPromise<GetSchoolAggregateType<T>>

    /**
     * Group by School.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SchoolGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SchoolGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SchoolGroupByArgs['orderBy'] }
        : { orderBy?: SchoolGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SchoolGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSchoolGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the School model
   */
  readonly fields: SchoolFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for School.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SchoolClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the School model
   */ 
  interface SchoolFieldRefs {
    readonly id: FieldRef<"School", 'String'>
    readonly name: FieldRef<"School", 'String'>
    readonly address: FieldRef<"School", 'String'>
    readonly lat: FieldRef<"School", 'Float'>
    readonly lng: FieldRef<"School", 'Float'>
    readonly updatedAt: FieldRef<"School", 'DateTime'>
    readonly contactPhone: FieldRef<"School", 'String'>
  }
    

  // Custom InputTypes
  /**
   * School findUnique
   */
  export type SchoolFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Filter, which School to fetch.
     */
    where: SchoolWhereUniqueInput
  }

  /**
   * School findUniqueOrThrow
   */
  export type SchoolFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Filter, which School to fetch.
     */
    where: SchoolWhereUniqueInput
  }

  /**
   * School findFirst
   */
  export type SchoolFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Filter, which School to fetch.
     */
    where?: SchoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schools to fetch.
     */
    orderBy?: SchoolOrderByWithRelationInput | SchoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Schools.
     */
    cursor?: SchoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Schools.
     */
    distinct?: SchoolScalarFieldEnum | SchoolScalarFieldEnum[]
  }

  /**
   * School findFirstOrThrow
   */
  export type SchoolFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Filter, which School to fetch.
     */
    where?: SchoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schools to fetch.
     */
    orderBy?: SchoolOrderByWithRelationInput | SchoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Schools.
     */
    cursor?: SchoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schools.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Schools.
     */
    distinct?: SchoolScalarFieldEnum | SchoolScalarFieldEnum[]
  }

  /**
   * School findMany
   */
  export type SchoolFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Filter, which Schools to fetch.
     */
    where?: SchoolWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Schools to fetch.
     */
    orderBy?: SchoolOrderByWithRelationInput | SchoolOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Schools.
     */
    cursor?: SchoolWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Schools from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Schools.
     */
    skip?: number
    distinct?: SchoolScalarFieldEnum | SchoolScalarFieldEnum[]
  }

  /**
   * School create
   */
  export type SchoolCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * The data needed to create a School.
     */
    data: XOR<SchoolCreateInput, SchoolUncheckedCreateInput>
  }

  /**
   * School createMany
   */
  export type SchoolCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Schools.
     */
    data: SchoolCreateManyInput | SchoolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * School createManyAndReturn
   */
  export type SchoolCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Schools.
     */
    data: SchoolCreateManyInput | SchoolCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * School update
   */
  export type SchoolUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * The data needed to update a School.
     */
    data: XOR<SchoolUpdateInput, SchoolUncheckedUpdateInput>
    /**
     * Choose, which School to update.
     */
    where: SchoolWhereUniqueInput
  }

  /**
   * School updateMany
   */
  export type SchoolUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Schools.
     */
    data: XOR<SchoolUpdateManyMutationInput, SchoolUncheckedUpdateManyInput>
    /**
     * Filter which Schools to update
     */
    where?: SchoolWhereInput
  }

  /**
   * School upsert
   */
  export type SchoolUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * The filter to search for the School to update in case it exists.
     */
    where: SchoolWhereUniqueInput
    /**
     * In case the School found by the `where` argument doesn't exist, create a new School with this data.
     */
    create: XOR<SchoolCreateInput, SchoolUncheckedCreateInput>
    /**
     * In case the School was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SchoolUpdateInput, SchoolUncheckedUpdateInput>
  }

  /**
   * School delete
   */
  export type SchoolDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
    /**
     * Filter which School to delete.
     */
    where: SchoolWhereUniqueInput
  }

  /**
   * School deleteMany
   */
  export type SchoolDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Schools to delete
     */
    where?: SchoolWhereInput
  }

  /**
   * School without action
   */
  export type SchoolDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the School
     */
    select?: SchoolSelect<ExtArgs> | null
  }


  /**
   * Model Admin
   */

  export type AggregateAdmin = {
    _count: AdminCountAggregateOutputType | null
    _min: AdminMinAggregateOutputType | null
    _max: AdminMaxAggregateOutputType | null
  }

  export type AdminMinAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    name: string | null
    createdAt: Date | null
  }

  export type AdminMaxAggregateOutputType = {
    id: string | null
    email: string | null
    password: string | null
    name: string | null
    createdAt: Date | null
  }

  export type AdminCountAggregateOutputType = {
    id: number
    email: number
    password: number
    name: number
    createdAt: number
    _all: number
  }


  export type AdminMinAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    createdAt?: true
  }

  export type AdminMaxAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    createdAt?: true
  }

  export type AdminCountAggregateInputType = {
    id?: true
    email?: true
    password?: true
    name?: true
    createdAt?: true
    _all?: true
  }

  export type AdminAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Admin to aggregate.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Admins
    **/
    _count?: true | AdminCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AdminMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AdminMaxAggregateInputType
  }

  export type GetAdminAggregateType<T extends AdminAggregateArgs> = {
        [P in keyof T & keyof AggregateAdmin]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAdmin[P]>
      : GetScalarType<T[P], AggregateAdmin[P]>
  }




  export type AdminGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AdminWhereInput
    orderBy?: AdminOrderByWithAggregationInput | AdminOrderByWithAggregationInput[]
    by: AdminScalarFieldEnum[] | AdminScalarFieldEnum
    having?: AdminScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AdminCountAggregateInputType | true
    _min?: AdminMinAggregateInputType
    _max?: AdminMaxAggregateInputType
  }

  export type AdminGroupByOutputType = {
    id: string
    email: string
    password: string
    name: string
    createdAt: Date
    _count: AdminCountAggregateOutputType | null
    _min: AdminMinAggregateOutputType | null
    _max: AdminMaxAggregateOutputType | null
  }

  type GetAdminGroupByPayload<T extends AdminGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AdminGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AdminGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AdminGroupByOutputType[P]>
            : GetScalarType<T[P], AdminGroupByOutputType[P]>
        }
      >
    >


  export type AdminSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["admin"]>

  export type AdminSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["admin"]>

  export type AdminSelectScalar = {
    id?: boolean
    email?: boolean
    password?: boolean
    name?: boolean
    createdAt?: boolean
  }


  export type $AdminPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Admin"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      password: string
      name: string
      createdAt: Date
    }, ExtArgs["result"]["admin"]>
    composites: {}
  }

  type AdminGetPayload<S extends boolean | null | undefined | AdminDefaultArgs> = $Result.GetResult<Prisma.$AdminPayload, S>

  type AdminCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AdminFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AdminCountAggregateInputType | true
    }

  export interface AdminDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Admin'], meta: { name: 'Admin' } }
    /**
     * Find zero or one Admin that matches the filter.
     * @param {AdminFindUniqueArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AdminFindUniqueArgs>(args: SelectSubset<T, AdminFindUniqueArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Admin that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AdminFindUniqueOrThrowArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AdminFindUniqueOrThrowArgs>(args: SelectSubset<T, AdminFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Admin that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindFirstArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AdminFindFirstArgs>(args?: SelectSubset<T, AdminFindFirstArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Admin that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindFirstOrThrowArgs} args - Arguments to find a Admin
     * @example
     * // Get one Admin
     * const admin = await prisma.admin.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AdminFindFirstOrThrowArgs>(args?: SelectSubset<T, AdminFindFirstOrThrowArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Admins that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Admins
     * const admins = await prisma.admin.findMany()
     * 
     * // Get first 10 Admins
     * const admins = await prisma.admin.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const adminWithIdOnly = await prisma.admin.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AdminFindManyArgs>(args?: SelectSubset<T, AdminFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Admin.
     * @param {AdminCreateArgs} args - Arguments to create a Admin.
     * @example
     * // Create one Admin
     * const Admin = await prisma.admin.create({
     *   data: {
     *     // ... data to create a Admin
     *   }
     * })
     * 
     */
    create<T extends AdminCreateArgs>(args: SelectSubset<T, AdminCreateArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Admins.
     * @param {AdminCreateManyArgs} args - Arguments to create many Admins.
     * @example
     * // Create many Admins
     * const admin = await prisma.admin.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AdminCreateManyArgs>(args?: SelectSubset<T, AdminCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Admins and returns the data saved in the database.
     * @param {AdminCreateManyAndReturnArgs} args - Arguments to create many Admins.
     * @example
     * // Create many Admins
     * const admin = await prisma.admin.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Admins and only return the `id`
     * const adminWithIdOnly = await prisma.admin.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AdminCreateManyAndReturnArgs>(args?: SelectSubset<T, AdminCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Admin.
     * @param {AdminDeleteArgs} args - Arguments to delete one Admin.
     * @example
     * // Delete one Admin
     * const Admin = await prisma.admin.delete({
     *   where: {
     *     // ... filter to delete one Admin
     *   }
     * })
     * 
     */
    delete<T extends AdminDeleteArgs>(args: SelectSubset<T, AdminDeleteArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Admin.
     * @param {AdminUpdateArgs} args - Arguments to update one Admin.
     * @example
     * // Update one Admin
     * const admin = await prisma.admin.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AdminUpdateArgs>(args: SelectSubset<T, AdminUpdateArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Admins.
     * @param {AdminDeleteManyArgs} args - Arguments to filter Admins to delete.
     * @example
     * // Delete a few Admins
     * const { count } = await prisma.admin.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AdminDeleteManyArgs>(args?: SelectSubset<T, AdminDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Admins
     * const admin = await prisma.admin.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AdminUpdateManyArgs>(args: SelectSubset<T, AdminUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Admin.
     * @param {AdminUpsertArgs} args - Arguments to update or create a Admin.
     * @example
     * // Update or create a Admin
     * const admin = await prisma.admin.upsert({
     *   create: {
     *     // ... data to create a Admin
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Admin we want to update
     *   }
     * })
     */
    upsert<T extends AdminUpsertArgs>(args: SelectSubset<T, AdminUpsertArgs<ExtArgs>>): Prisma__AdminClient<$Result.GetResult<Prisma.$AdminPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Admins.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminCountArgs} args - Arguments to filter Admins to count.
     * @example
     * // Count the number of Admins
     * const count = await prisma.admin.count({
     *   where: {
     *     // ... the filter for the Admins we want to count
     *   }
     * })
    **/
    count<T extends AdminCountArgs>(
      args?: Subset<T, AdminCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AdminCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Admin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AdminAggregateArgs>(args: Subset<T, AdminAggregateArgs>): Prisma.PrismaPromise<GetAdminAggregateType<T>>

    /**
     * Group by Admin.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AdminGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AdminGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AdminGroupByArgs['orderBy'] }
        : { orderBy?: AdminGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AdminGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAdminGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Admin model
   */
  readonly fields: AdminFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Admin.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AdminClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Admin model
   */ 
  interface AdminFieldRefs {
    readonly id: FieldRef<"Admin", 'String'>
    readonly email: FieldRef<"Admin", 'String'>
    readonly password: FieldRef<"Admin", 'String'>
    readonly name: FieldRef<"Admin", 'String'>
    readonly createdAt: FieldRef<"Admin", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Admin findUnique
   */
  export type AdminFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin findUniqueOrThrow
   */
  export type AdminFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin findFirst
   */
  export type AdminFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Admins.
     */
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin findFirstOrThrow
   */
  export type AdminFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admin to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Admins.
     */
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin findMany
   */
  export type AdminFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter, which Admins to fetch.
     */
    where?: AdminWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Admins to fetch.
     */
    orderBy?: AdminOrderByWithRelationInput | AdminOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Admins.
     */
    cursor?: AdminWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Admins from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Admins.
     */
    skip?: number
    distinct?: AdminScalarFieldEnum | AdminScalarFieldEnum[]
  }

  /**
   * Admin create
   */
  export type AdminCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * The data needed to create a Admin.
     */
    data: XOR<AdminCreateInput, AdminUncheckedCreateInput>
  }

  /**
   * Admin createMany
   */
  export type AdminCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Admins.
     */
    data: AdminCreateManyInput | AdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Admin createManyAndReturn
   */
  export type AdminCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Admins.
     */
    data: AdminCreateManyInput | AdminCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Admin update
   */
  export type AdminUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * The data needed to update a Admin.
     */
    data: XOR<AdminUpdateInput, AdminUncheckedUpdateInput>
    /**
     * Choose, which Admin to update.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin updateMany
   */
  export type AdminUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Admins.
     */
    data: XOR<AdminUpdateManyMutationInput, AdminUncheckedUpdateManyInput>
    /**
     * Filter which Admins to update
     */
    where?: AdminWhereInput
  }

  /**
   * Admin upsert
   */
  export type AdminUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * The filter to search for the Admin to update in case it exists.
     */
    where: AdminWhereUniqueInput
    /**
     * In case the Admin found by the `where` argument doesn't exist, create a new Admin with this data.
     */
    create: XOR<AdminCreateInput, AdminUncheckedCreateInput>
    /**
     * In case the Admin was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AdminUpdateInput, AdminUncheckedUpdateInput>
  }

  /**
   * Admin delete
   */
  export type AdminDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
    /**
     * Filter which Admin to delete.
     */
    where: AdminWhereUniqueInput
  }

  /**
   * Admin deleteMany
   */
  export type AdminDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Admins to delete
     */
    where?: AdminWhereInput
  }

  /**
   * Admin without action
   */
  export type AdminDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Admin
     */
    select?: AdminSelect<ExtArgs> | null
  }


  /**
   * Model Attendance
   */

  export type AggregateAttendance = {
    _count: AttendanceCountAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  export type AttendanceMinAggregateOutputType = {
    id: string | null
    busId: string | null
    studentId: string | null
    date: string | null
    tripType: string | null
    boarded: boolean | null
    createdAt: Date | null
    tripId: string | null
    conductorId: string | null
    checkedAt: Date | null
    type: string | null
  }

  export type AttendanceMaxAggregateOutputType = {
    id: string | null
    busId: string | null
    studentId: string | null
    date: string | null
    tripType: string | null
    boarded: boolean | null
    createdAt: Date | null
    tripId: string | null
    conductorId: string | null
    checkedAt: Date | null
    type: string | null
  }

  export type AttendanceCountAggregateOutputType = {
    id: number
    busId: number
    studentId: number
    date: number
    tripType: number
    boarded: number
    createdAt: number
    tripId: number
    conductorId: number
    checkedAt: number
    type: number
    _all: number
  }


  export type AttendanceMinAggregateInputType = {
    id?: true
    busId?: true
    studentId?: true
    date?: true
    tripType?: true
    boarded?: true
    createdAt?: true
    tripId?: true
    conductorId?: true
    checkedAt?: true
    type?: true
  }

  export type AttendanceMaxAggregateInputType = {
    id?: true
    busId?: true
    studentId?: true
    date?: true
    tripType?: true
    boarded?: true
    createdAt?: true
    tripId?: true
    conductorId?: true
    checkedAt?: true
    type?: true
  }

  export type AttendanceCountAggregateInputType = {
    id?: true
    busId?: true
    studentId?: true
    date?: true
    tripType?: true
    boarded?: true
    createdAt?: true
    tripId?: true
    conductorId?: true
    checkedAt?: true
    type?: true
    _all?: true
  }

  export type AttendanceAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendance to aggregate.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Attendances
    **/
    _count?: true | AttendanceCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttendanceMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttendanceMaxAggregateInputType
  }

  export type GetAttendanceAggregateType<T extends AttendanceAggregateArgs> = {
        [P in keyof T & keyof AggregateAttendance]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttendance[P]>
      : GetScalarType<T[P], AggregateAttendance[P]>
  }




  export type AttendanceGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttendanceWhereInput
    orderBy?: AttendanceOrderByWithAggregationInput | AttendanceOrderByWithAggregationInput[]
    by: AttendanceScalarFieldEnum[] | AttendanceScalarFieldEnum
    having?: AttendanceScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttendanceCountAggregateInputType | true
    _min?: AttendanceMinAggregateInputType
    _max?: AttendanceMaxAggregateInputType
  }

  export type AttendanceGroupByOutputType = {
    id: string
    busId: string
    studentId: string
    date: string
    tripType: string
    boarded: boolean | null
    createdAt: Date
    tripId: string | null
    conductorId: string | null
    checkedAt: Date | null
    type: string | null
    _count: AttendanceCountAggregateOutputType | null
    _min: AttendanceMinAggregateOutputType | null
    _max: AttendanceMaxAggregateOutputType | null
  }

  type GetAttendanceGroupByPayload<T extends AttendanceGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttendanceGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttendanceGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
            : GetScalarType<T[P], AttendanceGroupByOutputType[P]>
        }
      >
    >


  export type AttendanceSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busId?: boolean
    studentId?: boolean
    date?: boolean
    tripType?: boolean
    boarded?: boolean
    createdAt?: boolean
    tripId?: boolean
    conductorId?: boolean
    checkedAt?: boolean
    type?: boolean
  }, ExtArgs["result"]["attendance"]>

  export type AttendanceSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busId?: boolean
    studentId?: boolean
    date?: boolean
    tripType?: boolean
    boarded?: boolean
    createdAt?: boolean
    tripId?: boolean
    conductorId?: boolean
    checkedAt?: boolean
    type?: boolean
  }, ExtArgs["result"]["attendance"]>

  export type AttendanceSelectScalar = {
    id?: boolean
    busId?: boolean
    studentId?: boolean
    date?: boolean
    tripType?: boolean
    boarded?: boolean
    createdAt?: boolean
    tripId?: boolean
    conductorId?: boolean
    checkedAt?: boolean
    type?: boolean
  }


  export type $AttendancePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Attendance"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      busId: string
      studentId: string
      date: string
      tripType: string
      boarded: boolean | null
      createdAt: Date
      tripId: string | null
      conductorId: string | null
      checkedAt: Date | null
      type: string | null
    }, ExtArgs["result"]["attendance"]>
    composites: {}
  }

  type AttendanceGetPayload<S extends boolean | null | undefined | AttendanceDefaultArgs> = $Result.GetResult<Prisma.$AttendancePayload, S>

  type AttendanceCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AttendanceFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AttendanceCountAggregateInputType | true
    }

  export interface AttendanceDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Attendance'], meta: { name: 'Attendance' } }
    /**
     * Find zero or one Attendance that matches the filter.
     * @param {AttendanceFindUniqueArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttendanceFindUniqueArgs>(args: SelectSubset<T, AttendanceFindUniqueArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Attendance that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AttendanceFindUniqueOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttendanceFindUniqueOrThrowArgs>(args: SelectSubset<T, AttendanceFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Attendance that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttendanceFindFirstArgs>(args?: SelectSubset<T, AttendanceFindFirstArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Attendance that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindFirstOrThrowArgs} args - Arguments to find a Attendance
     * @example
     * // Get one Attendance
     * const attendance = await prisma.attendance.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttendanceFindFirstOrThrowArgs>(args?: SelectSubset<T, AttendanceFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Attendances that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Attendances
     * const attendances = await prisma.attendance.findMany()
     * 
     * // Get first 10 Attendances
     * const attendances = await prisma.attendance.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attendanceWithIdOnly = await prisma.attendance.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttendanceFindManyArgs>(args?: SelectSubset<T, AttendanceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Attendance.
     * @param {AttendanceCreateArgs} args - Arguments to create a Attendance.
     * @example
     * // Create one Attendance
     * const Attendance = await prisma.attendance.create({
     *   data: {
     *     // ... data to create a Attendance
     *   }
     * })
     * 
     */
    create<T extends AttendanceCreateArgs>(args: SelectSubset<T, AttendanceCreateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Attendances.
     * @param {AttendanceCreateManyArgs} args - Arguments to create many Attendances.
     * @example
     * // Create many Attendances
     * const attendance = await prisma.attendance.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttendanceCreateManyArgs>(args?: SelectSubset<T, AttendanceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Attendances and returns the data saved in the database.
     * @param {AttendanceCreateManyAndReturnArgs} args - Arguments to create many Attendances.
     * @example
     * // Create many Attendances
     * const attendance = await prisma.attendance.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Attendances and only return the `id`
     * const attendanceWithIdOnly = await prisma.attendance.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AttendanceCreateManyAndReturnArgs>(args?: SelectSubset<T, AttendanceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Attendance.
     * @param {AttendanceDeleteArgs} args - Arguments to delete one Attendance.
     * @example
     * // Delete one Attendance
     * const Attendance = await prisma.attendance.delete({
     *   where: {
     *     // ... filter to delete one Attendance
     *   }
     * })
     * 
     */
    delete<T extends AttendanceDeleteArgs>(args: SelectSubset<T, AttendanceDeleteArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Attendance.
     * @param {AttendanceUpdateArgs} args - Arguments to update one Attendance.
     * @example
     * // Update one Attendance
     * const attendance = await prisma.attendance.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttendanceUpdateArgs>(args: SelectSubset<T, AttendanceUpdateArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Attendances.
     * @param {AttendanceDeleteManyArgs} args - Arguments to filter Attendances to delete.
     * @example
     * // Delete a few Attendances
     * const { count } = await prisma.attendance.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttendanceDeleteManyArgs>(args?: SelectSubset<T, AttendanceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Attendances
     * const attendance = await prisma.attendance.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttendanceUpdateManyArgs>(args: SelectSubset<T, AttendanceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Attendance.
     * @param {AttendanceUpsertArgs} args - Arguments to update or create a Attendance.
     * @example
     * // Update or create a Attendance
     * const attendance = await prisma.attendance.upsert({
     *   create: {
     *     // ... data to create a Attendance
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Attendance we want to update
     *   }
     * })
     */
    upsert<T extends AttendanceUpsertArgs>(args: SelectSubset<T, AttendanceUpsertArgs<ExtArgs>>): Prisma__AttendanceClient<$Result.GetResult<Prisma.$AttendancePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Attendances.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceCountArgs} args - Arguments to filter Attendances to count.
     * @example
     * // Count the number of Attendances
     * const count = await prisma.attendance.count({
     *   where: {
     *     // ... the filter for the Attendances we want to count
     *   }
     * })
    **/
    count<T extends AttendanceCountArgs>(
      args?: Subset<T, AttendanceCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttendanceCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AttendanceAggregateArgs>(args: Subset<T, AttendanceAggregateArgs>): Prisma.PrismaPromise<GetAttendanceAggregateType<T>>

    /**
     * Group by Attendance.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttendanceGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AttendanceGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttendanceGroupByArgs['orderBy'] }
        : { orderBy?: AttendanceGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AttendanceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttendanceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Attendance model
   */
  readonly fields: AttendanceFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Attendance.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttendanceClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Attendance model
   */ 
  interface AttendanceFieldRefs {
    readonly id: FieldRef<"Attendance", 'String'>
    readonly busId: FieldRef<"Attendance", 'String'>
    readonly studentId: FieldRef<"Attendance", 'String'>
    readonly date: FieldRef<"Attendance", 'String'>
    readonly tripType: FieldRef<"Attendance", 'String'>
    readonly boarded: FieldRef<"Attendance", 'Boolean'>
    readonly createdAt: FieldRef<"Attendance", 'DateTime'>
    readonly tripId: FieldRef<"Attendance", 'String'>
    readonly conductorId: FieldRef<"Attendance", 'String'>
    readonly checkedAt: FieldRef<"Attendance", 'DateTime'>
    readonly type: FieldRef<"Attendance", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Attendance findUnique
   */
  export type AttendanceFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findUniqueOrThrow
   */
  export type AttendanceFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance findFirst
   */
  export type AttendanceFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findFirstOrThrow
   */
  export type AttendanceFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Filter, which Attendance to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Attendances.
     */
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance findMany
   */
  export type AttendanceFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Filter, which Attendances to fetch.
     */
    where?: AttendanceWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Attendances to fetch.
     */
    orderBy?: AttendanceOrderByWithRelationInput | AttendanceOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Attendances.
     */
    cursor?: AttendanceWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Attendances from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Attendances.
     */
    skip?: number
    distinct?: AttendanceScalarFieldEnum | AttendanceScalarFieldEnum[]
  }

  /**
   * Attendance create
   */
  export type AttendanceCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * The data needed to create a Attendance.
     */
    data: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
  }

  /**
   * Attendance createMany
   */
  export type AttendanceCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Attendances.
     */
    data: AttendanceCreateManyInput | AttendanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attendance createManyAndReturn
   */
  export type AttendanceCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Attendances.
     */
    data: AttendanceCreateManyInput | AttendanceCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Attendance update
   */
  export type AttendanceUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * The data needed to update a Attendance.
     */
    data: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
    /**
     * Choose, which Attendance to update.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance updateMany
   */
  export type AttendanceUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Attendances.
     */
    data: XOR<AttendanceUpdateManyMutationInput, AttendanceUncheckedUpdateManyInput>
    /**
     * Filter which Attendances to update
     */
    where?: AttendanceWhereInput
  }

  /**
   * Attendance upsert
   */
  export type AttendanceUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * The filter to search for the Attendance to update in case it exists.
     */
    where: AttendanceWhereUniqueInput
    /**
     * In case the Attendance found by the `where` argument doesn't exist, create a new Attendance with this data.
     */
    create: XOR<AttendanceCreateInput, AttendanceUncheckedCreateInput>
    /**
     * In case the Attendance was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttendanceUpdateInput, AttendanceUncheckedUpdateInput>
  }

  /**
   * Attendance delete
   */
  export type AttendanceDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
    /**
     * Filter which Attendance to delete.
     */
    where: AttendanceWhereUniqueInput
  }

  /**
   * Attendance deleteMany
   */
  export type AttendanceDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Attendances to delete
     */
    where?: AttendanceWhereInput
  }

  /**
   * Attendance without action
   */
  export type AttendanceDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Attendance
     */
    select?: AttendanceSelect<ExtArgs> | null
  }


  /**
   * Model Driver
   */

  export type AggregateDriver = {
    _count: DriverCountAggregateOutputType | null
    _avg: DriverAvgAggregateOutputType | null
    _sum: DriverSumAggregateOutputType | null
    _min: DriverMinAggregateOutputType | null
    _max: DriverMaxAggregateOutputType | null
  }

  export type DriverAvgAggregateOutputType = {
    experience: number | null
  }

  export type DriverSumAggregateOutputType = {
    experience: number | null
  }

  export type DriverMinAggregateOutputType = {
    id: string | null
    name: string | null
    phone: string | null
    busId: string | null
    createdAt: Date | null
    licenseNo: string | null
    licenseExpiry: string | null
    experience: number | null
  }

  export type DriverMaxAggregateOutputType = {
    id: string | null
    name: string | null
    phone: string | null
    busId: string | null
    createdAt: Date | null
    licenseNo: string | null
    licenseExpiry: string | null
    experience: number | null
  }

  export type DriverCountAggregateOutputType = {
    id: number
    name: number
    phone: number
    busId: number
    createdAt: number
    licenseNo: number
    licenseExpiry: number
    experience: number
    _all: number
  }


  export type DriverAvgAggregateInputType = {
    experience?: true
  }

  export type DriverSumAggregateInputType = {
    experience?: true
  }

  export type DriverMinAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    busId?: true
    createdAt?: true
    licenseNo?: true
    licenseExpiry?: true
    experience?: true
  }

  export type DriverMaxAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    busId?: true
    createdAt?: true
    licenseNo?: true
    licenseExpiry?: true
    experience?: true
  }

  export type DriverCountAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    busId?: true
    createdAt?: true
    licenseNo?: true
    licenseExpiry?: true
    experience?: true
    _all?: true
  }

  export type DriverAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Driver to aggregate.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Drivers
    **/
    _count?: true | DriverCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DriverAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DriverSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DriverMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DriverMaxAggregateInputType
  }

  export type GetDriverAggregateType<T extends DriverAggregateArgs> = {
        [P in keyof T & keyof AggregateDriver]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDriver[P]>
      : GetScalarType<T[P], AggregateDriver[P]>
  }




  export type DriverGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DriverWhereInput
    orderBy?: DriverOrderByWithAggregationInput | DriverOrderByWithAggregationInput[]
    by: DriverScalarFieldEnum[] | DriverScalarFieldEnum
    having?: DriverScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DriverCountAggregateInputType | true
    _avg?: DriverAvgAggregateInputType
    _sum?: DriverSumAggregateInputType
    _min?: DriverMinAggregateInputType
    _max?: DriverMaxAggregateInputType
  }

  export type DriverGroupByOutputType = {
    id: string
    name: string
    phone: string
    busId: string | null
    createdAt: Date
    licenseNo: string | null
    licenseExpiry: string | null
    experience: number | null
    _count: DriverCountAggregateOutputType | null
    _avg: DriverAvgAggregateOutputType | null
    _sum: DriverSumAggregateOutputType | null
    _min: DriverMinAggregateOutputType | null
    _max: DriverMaxAggregateOutputType | null
  }

  type GetDriverGroupByPayload<T extends DriverGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DriverGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DriverGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DriverGroupByOutputType[P]>
            : GetScalarType<T[P], DriverGroupByOutputType[P]>
        }
      >
    >


  export type DriverSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    busId?: boolean
    createdAt?: boolean
    licenseNo?: boolean
    licenseExpiry?: boolean
    experience?: boolean
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    busId?: boolean
    createdAt?: boolean
    licenseNo?: boolean
    licenseExpiry?: boolean
    experience?: boolean
  }, ExtArgs["result"]["driver"]>

  export type DriverSelectScalar = {
    id?: boolean
    name?: boolean
    phone?: boolean
    busId?: boolean
    createdAt?: boolean
    licenseNo?: boolean
    licenseExpiry?: boolean
    experience?: boolean
  }


  export type $DriverPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Driver"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      phone: string
      busId: string | null
      createdAt: Date
      licenseNo: string | null
      licenseExpiry: string | null
      experience: number | null
    }, ExtArgs["result"]["driver"]>
    composites: {}
  }

  type DriverGetPayload<S extends boolean | null | undefined | DriverDefaultArgs> = $Result.GetResult<Prisma.$DriverPayload, S>

  type DriverCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<DriverFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: DriverCountAggregateInputType | true
    }

  export interface DriverDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Driver'], meta: { name: 'Driver' } }
    /**
     * Find zero or one Driver that matches the filter.
     * @param {DriverFindUniqueArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DriverFindUniqueArgs>(args: SelectSubset<T, DriverFindUniqueArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Driver that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {DriverFindUniqueOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DriverFindUniqueOrThrowArgs>(args: SelectSubset<T, DriverFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Driver that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DriverFindFirstArgs>(args?: SelectSubset<T, DriverFindFirstArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Driver that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindFirstOrThrowArgs} args - Arguments to find a Driver
     * @example
     * // Get one Driver
     * const driver = await prisma.driver.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DriverFindFirstOrThrowArgs>(args?: SelectSubset<T, DriverFindFirstOrThrowArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Drivers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Drivers
     * const drivers = await prisma.driver.findMany()
     * 
     * // Get first 10 Drivers
     * const drivers = await prisma.driver.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const driverWithIdOnly = await prisma.driver.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DriverFindManyArgs>(args?: SelectSubset<T, DriverFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Driver.
     * @param {DriverCreateArgs} args - Arguments to create a Driver.
     * @example
     * // Create one Driver
     * const Driver = await prisma.driver.create({
     *   data: {
     *     // ... data to create a Driver
     *   }
     * })
     * 
     */
    create<T extends DriverCreateArgs>(args: SelectSubset<T, DriverCreateArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Drivers.
     * @param {DriverCreateManyArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DriverCreateManyArgs>(args?: SelectSubset<T, DriverCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Drivers and returns the data saved in the database.
     * @param {DriverCreateManyAndReturnArgs} args - Arguments to create many Drivers.
     * @example
     * // Create many Drivers
     * const driver = await prisma.driver.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Drivers and only return the `id`
     * const driverWithIdOnly = await prisma.driver.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DriverCreateManyAndReturnArgs>(args?: SelectSubset<T, DriverCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Driver.
     * @param {DriverDeleteArgs} args - Arguments to delete one Driver.
     * @example
     * // Delete one Driver
     * const Driver = await prisma.driver.delete({
     *   where: {
     *     // ... filter to delete one Driver
     *   }
     * })
     * 
     */
    delete<T extends DriverDeleteArgs>(args: SelectSubset<T, DriverDeleteArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Driver.
     * @param {DriverUpdateArgs} args - Arguments to update one Driver.
     * @example
     * // Update one Driver
     * const driver = await prisma.driver.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DriverUpdateArgs>(args: SelectSubset<T, DriverUpdateArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Drivers.
     * @param {DriverDeleteManyArgs} args - Arguments to filter Drivers to delete.
     * @example
     * // Delete a few Drivers
     * const { count } = await prisma.driver.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DriverDeleteManyArgs>(args?: SelectSubset<T, DriverDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Drivers
     * const driver = await prisma.driver.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DriverUpdateManyArgs>(args: SelectSubset<T, DriverUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Driver.
     * @param {DriverUpsertArgs} args - Arguments to update or create a Driver.
     * @example
     * // Update or create a Driver
     * const driver = await prisma.driver.upsert({
     *   create: {
     *     // ... data to create a Driver
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Driver we want to update
     *   }
     * })
     */
    upsert<T extends DriverUpsertArgs>(args: SelectSubset<T, DriverUpsertArgs<ExtArgs>>): Prisma__DriverClient<$Result.GetResult<Prisma.$DriverPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Drivers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverCountArgs} args - Arguments to filter Drivers to count.
     * @example
     * // Count the number of Drivers
     * const count = await prisma.driver.count({
     *   where: {
     *     // ... the filter for the Drivers we want to count
     *   }
     * })
    **/
    count<T extends DriverCountArgs>(
      args?: Subset<T, DriverCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DriverCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DriverAggregateArgs>(args: Subset<T, DriverAggregateArgs>): Prisma.PrismaPromise<GetDriverAggregateType<T>>

    /**
     * Group by Driver.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DriverGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DriverGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DriverGroupByArgs['orderBy'] }
        : { orderBy?: DriverGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DriverGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDriverGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Driver model
   */
  readonly fields: DriverFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Driver.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DriverClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Driver model
   */ 
  interface DriverFieldRefs {
    readonly id: FieldRef<"Driver", 'String'>
    readonly name: FieldRef<"Driver", 'String'>
    readonly phone: FieldRef<"Driver", 'String'>
    readonly busId: FieldRef<"Driver", 'String'>
    readonly createdAt: FieldRef<"Driver", 'DateTime'>
    readonly licenseNo: FieldRef<"Driver", 'String'>
    readonly licenseExpiry: FieldRef<"Driver", 'String'>
    readonly experience: FieldRef<"Driver", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * Driver findUnique
   */
  export type DriverFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver findUniqueOrThrow
   */
  export type DriverFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver findFirst
   */
  export type DriverFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver findFirstOrThrow
   */
  export type DriverFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Filter, which Driver to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Drivers.
     */
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver findMany
   */
  export type DriverFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Filter, which Drivers to fetch.
     */
    where?: DriverWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Drivers to fetch.
     */
    orderBy?: DriverOrderByWithRelationInput | DriverOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Drivers.
     */
    cursor?: DriverWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Drivers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Drivers.
     */
    skip?: number
    distinct?: DriverScalarFieldEnum | DriverScalarFieldEnum[]
  }

  /**
   * Driver create
   */
  export type DriverCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * The data needed to create a Driver.
     */
    data: XOR<DriverCreateInput, DriverUncheckedCreateInput>
  }

  /**
   * Driver createMany
   */
  export type DriverCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Driver createManyAndReturn
   */
  export type DriverCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Drivers.
     */
    data: DriverCreateManyInput | DriverCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Driver update
   */
  export type DriverUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * The data needed to update a Driver.
     */
    data: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>
    /**
     * Choose, which Driver to update.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver updateMany
   */
  export type DriverUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Drivers.
     */
    data: XOR<DriverUpdateManyMutationInput, DriverUncheckedUpdateManyInput>
    /**
     * Filter which Drivers to update
     */
    where?: DriverWhereInput
  }

  /**
   * Driver upsert
   */
  export type DriverUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * The filter to search for the Driver to update in case it exists.
     */
    where: DriverWhereUniqueInput
    /**
     * In case the Driver found by the `where` argument doesn't exist, create a new Driver with this data.
     */
    create: XOR<DriverCreateInput, DriverUncheckedCreateInput>
    /**
     * In case the Driver was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DriverUpdateInput, DriverUncheckedUpdateInput>
  }

  /**
   * Driver delete
   */
  export type DriverDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
    /**
     * Filter which Driver to delete.
     */
    where: DriverWhereUniqueInput
  }

  /**
   * Driver deleteMany
   */
  export type DriverDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Drivers to delete
     */
    where?: DriverWhereInput
  }

  /**
   * Driver without action
   */
  export type DriverDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Driver
     */
    select?: DriverSelect<ExtArgs> | null
  }


  /**
   * Model Conductor
   */

  export type AggregateConductor = {
    _count: ConductorCountAggregateOutputType | null
    _min: ConductorMinAggregateOutputType | null
    _max: ConductorMaxAggregateOutputType | null
  }

  export type ConductorMinAggregateOutputType = {
    id: string | null
    name: string | null
    phone: string | null
    busId: string | null
    createdAt: Date | null
  }

  export type ConductorMaxAggregateOutputType = {
    id: string | null
    name: string | null
    phone: string | null
    busId: string | null
    createdAt: Date | null
  }

  export type ConductorCountAggregateOutputType = {
    id: number
    name: number
    phone: number
    busId: number
    createdAt: number
    _all: number
  }


  export type ConductorMinAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    busId?: true
    createdAt?: true
  }

  export type ConductorMaxAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    busId?: true
    createdAt?: true
  }

  export type ConductorCountAggregateInputType = {
    id?: true
    name?: true
    phone?: true
    busId?: true
    createdAt?: true
    _all?: true
  }

  export type ConductorAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conductor to aggregate.
     */
    where?: ConductorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conductors to fetch.
     */
    orderBy?: ConductorOrderByWithRelationInput | ConductorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ConductorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conductors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conductors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Conductors
    **/
    _count?: true | ConductorCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ConductorMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ConductorMaxAggregateInputType
  }

  export type GetConductorAggregateType<T extends ConductorAggregateArgs> = {
        [P in keyof T & keyof AggregateConductor]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateConductor[P]>
      : GetScalarType<T[P], AggregateConductor[P]>
  }




  export type ConductorGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ConductorWhereInput
    orderBy?: ConductorOrderByWithAggregationInput | ConductorOrderByWithAggregationInput[]
    by: ConductorScalarFieldEnum[] | ConductorScalarFieldEnum
    having?: ConductorScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ConductorCountAggregateInputType | true
    _min?: ConductorMinAggregateInputType
    _max?: ConductorMaxAggregateInputType
  }

  export type ConductorGroupByOutputType = {
    id: string
    name: string
    phone: string
    busId: string | null
    createdAt: Date
    _count: ConductorCountAggregateOutputType | null
    _min: ConductorMinAggregateOutputType | null
    _max: ConductorMaxAggregateOutputType | null
  }

  type GetConductorGroupByPayload<T extends ConductorGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ConductorGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ConductorGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ConductorGroupByOutputType[P]>
            : GetScalarType<T[P], ConductorGroupByOutputType[P]>
        }
      >
    >


  export type ConductorSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    busId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["conductor"]>

  export type ConductorSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    phone?: boolean
    busId?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["conductor"]>

  export type ConductorSelectScalar = {
    id?: boolean
    name?: boolean
    phone?: boolean
    busId?: boolean
    createdAt?: boolean
  }


  export type $ConductorPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Conductor"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      phone: string
      busId: string | null
      createdAt: Date
    }, ExtArgs["result"]["conductor"]>
    composites: {}
  }

  type ConductorGetPayload<S extends boolean | null | undefined | ConductorDefaultArgs> = $Result.GetResult<Prisma.$ConductorPayload, S>

  type ConductorCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ConductorFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ConductorCountAggregateInputType | true
    }

  export interface ConductorDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Conductor'], meta: { name: 'Conductor' } }
    /**
     * Find zero or one Conductor that matches the filter.
     * @param {ConductorFindUniqueArgs} args - Arguments to find a Conductor
     * @example
     * // Get one Conductor
     * const conductor = await prisma.conductor.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ConductorFindUniqueArgs>(args: SelectSubset<T, ConductorFindUniqueArgs<ExtArgs>>): Prisma__ConductorClient<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Conductor that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ConductorFindUniqueOrThrowArgs} args - Arguments to find a Conductor
     * @example
     * // Get one Conductor
     * const conductor = await prisma.conductor.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ConductorFindUniqueOrThrowArgs>(args: SelectSubset<T, ConductorFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ConductorClient<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Conductor that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConductorFindFirstArgs} args - Arguments to find a Conductor
     * @example
     * // Get one Conductor
     * const conductor = await prisma.conductor.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ConductorFindFirstArgs>(args?: SelectSubset<T, ConductorFindFirstArgs<ExtArgs>>): Prisma__ConductorClient<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Conductor that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConductorFindFirstOrThrowArgs} args - Arguments to find a Conductor
     * @example
     * // Get one Conductor
     * const conductor = await prisma.conductor.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ConductorFindFirstOrThrowArgs>(args?: SelectSubset<T, ConductorFindFirstOrThrowArgs<ExtArgs>>): Prisma__ConductorClient<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Conductors that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConductorFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Conductors
     * const conductors = await prisma.conductor.findMany()
     * 
     * // Get first 10 Conductors
     * const conductors = await prisma.conductor.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const conductorWithIdOnly = await prisma.conductor.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ConductorFindManyArgs>(args?: SelectSubset<T, ConductorFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Conductor.
     * @param {ConductorCreateArgs} args - Arguments to create a Conductor.
     * @example
     * // Create one Conductor
     * const Conductor = await prisma.conductor.create({
     *   data: {
     *     // ... data to create a Conductor
     *   }
     * })
     * 
     */
    create<T extends ConductorCreateArgs>(args: SelectSubset<T, ConductorCreateArgs<ExtArgs>>): Prisma__ConductorClient<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Conductors.
     * @param {ConductorCreateManyArgs} args - Arguments to create many Conductors.
     * @example
     * // Create many Conductors
     * const conductor = await prisma.conductor.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ConductorCreateManyArgs>(args?: SelectSubset<T, ConductorCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Conductors and returns the data saved in the database.
     * @param {ConductorCreateManyAndReturnArgs} args - Arguments to create many Conductors.
     * @example
     * // Create many Conductors
     * const conductor = await prisma.conductor.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Conductors and only return the `id`
     * const conductorWithIdOnly = await prisma.conductor.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ConductorCreateManyAndReturnArgs>(args?: SelectSubset<T, ConductorCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Conductor.
     * @param {ConductorDeleteArgs} args - Arguments to delete one Conductor.
     * @example
     * // Delete one Conductor
     * const Conductor = await prisma.conductor.delete({
     *   where: {
     *     // ... filter to delete one Conductor
     *   }
     * })
     * 
     */
    delete<T extends ConductorDeleteArgs>(args: SelectSubset<T, ConductorDeleteArgs<ExtArgs>>): Prisma__ConductorClient<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Conductor.
     * @param {ConductorUpdateArgs} args - Arguments to update one Conductor.
     * @example
     * // Update one Conductor
     * const conductor = await prisma.conductor.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ConductorUpdateArgs>(args: SelectSubset<T, ConductorUpdateArgs<ExtArgs>>): Prisma__ConductorClient<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Conductors.
     * @param {ConductorDeleteManyArgs} args - Arguments to filter Conductors to delete.
     * @example
     * // Delete a few Conductors
     * const { count } = await prisma.conductor.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ConductorDeleteManyArgs>(args?: SelectSubset<T, ConductorDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Conductors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConductorUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Conductors
     * const conductor = await prisma.conductor.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ConductorUpdateManyArgs>(args: SelectSubset<T, ConductorUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Conductor.
     * @param {ConductorUpsertArgs} args - Arguments to update or create a Conductor.
     * @example
     * // Update or create a Conductor
     * const conductor = await prisma.conductor.upsert({
     *   create: {
     *     // ... data to create a Conductor
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Conductor we want to update
     *   }
     * })
     */
    upsert<T extends ConductorUpsertArgs>(args: SelectSubset<T, ConductorUpsertArgs<ExtArgs>>): Prisma__ConductorClient<$Result.GetResult<Prisma.$ConductorPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Conductors.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConductorCountArgs} args - Arguments to filter Conductors to count.
     * @example
     * // Count the number of Conductors
     * const count = await prisma.conductor.count({
     *   where: {
     *     // ... the filter for the Conductors we want to count
     *   }
     * })
    **/
    count<T extends ConductorCountArgs>(
      args?: Subset<T, ConductorCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ConductorCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Conductor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConductorAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ConductorAggregateArgs>(args: Subset<T, ConductorAggregateArgs>): Prisma.PrismaPromise<GetConductorAggregateType<T>>

    /**
     * Group by Conductor.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ConductorGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ConductorGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ConductorGroupByArgs['orderBy'] }
        : { orderBy?: ConductorGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ConductorGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetConductorGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Conductor model
   */
  readonly fields: ConductorFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Conductor.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ConductorClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Conductor model
   */ 
  interface ConductorFieldRefs {
    readonly id: FieldRef<"Conductor", 'String'>
    readonly name: FieldRef<"Conductor", 'String'>
    readonly phone: FieldRef<"Conductor", 'String'>
    readonly busId: FieldRef<"Conductor", 'String'>
    readonly createdAt: FieldRef<"Conductor", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Conductor findUnique
   */
  export type ConductorFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * Filter, which Conductor to fetch.
     */
    where: ConductorWhereUniqueInput
  }

  /**
   * Conductor findUniqueOrThrow
   */
  export type ConductorFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * Filter, which Conductor to fetch.
     */
    where: ConductorWhereUniqueInput
  }

  /**
   * Conductor findFirst
   */
  export type ConductorFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * Filter, which Conductor to fetch.
     */
    where?: ConductorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conductors to fetch.
     */
    orderBy?: ConductorOrderByWithRelationInput | ConductorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conductors.
     */
    cursor?: ConductorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conductors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conductors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conductors.
     */
    distinct?: ConductorScalarFieldEnum | ConductorScalarFieldEnum[]
  }

  /**
   * Conductor findFirstOrThrow
   */
  export type ConductorFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * Filter, which Conductor to fetch.
     */
    where?: ConductorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conductors to fetch.
     */
    orderBy?: ConductorOrderByWithRelationInput | ConductorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Conductors.
     */
    cursor?: ConductorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conductors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conductors.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Conductors.
     */
    distinct?: ConductorScalarFieldEnum | ConductorScalarFieldEnum[]
  }

  /**
   * Conductor findMany
   */
  export type ConductorFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * Filter, which Conductors to fetch.
     */
    where?: ConductorWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Conductors to fetch.
     */
    orderBy?: ConductorOrderByWithRelationInput | ConductorOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Conductors.
     */
    cursor?: ConductorWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Conductors from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Conductors.
     */
    skip?: number
    distinct?: ConductorScalarFieldEnum | ConductorScalarFieldEnum[]
  }

  /**
   * Conductor create
   */
  export type ConductorCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * The data needed to create a Conductor.
     */
    data: XOR<ConductorCreateInput, ConductorUncheckedCreateInput>
  }

  /**
   * Conductor createMany
   */
  export type ConductorCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Conductors.
     */
    data: ConductorCreateManyInput | ConductorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Conductor createManyAndReturn
   */
  export type ConductorCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Conductors.
     */
    data: ConductorCreateManyInput | ConductorCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Conductor update
   */
  export type ConductorUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * The data needed to update a Conductor.
     */
    data: XOR<ConductorUpdateInput, ConductorUncheckedUpdateInput>
    /**
     * Choose, which Conductor to update.
     */
    where: ConductorWhereUniqueInput
  }

  /**
   * Conductor updateMany
   */
  export type ConductorUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Conductors.
     */
    data: XOR<ConductorUpdateManyMutationInput, ConductorUncheckedUpdateManyInput>
    /**
     * Filter which Conductors to update
     */
    where?: ConductorWhereInput
  }

  /**
   * Conductor upsert
   */
  export type ConductorUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * The filter to search for the Conductor to update in case it exists.
     */
    where: ConductorWhereUniqueInput
    /**
     * In case the Conductor found by the `where` argument doesn't exist, create a new Conductor with this data.
     */
    create: XOR<ConductorCreateInput, ConductorUncheckedCreateInput>
    /**
     * In case the Conductor was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ConductorUpdateInput, ConductorUncheckedUpdateInput>
  }

  /**
   * Conductor delete
   */
  export type ConductorDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
    /**
     * Filter which Conductor to delete.
     */
    where: ConductorWhereUniqueInput
  }

  /**
   * Conductor deleteMany
   */
  export type ConductorDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Conductors to delete
     */
    where?: ConductorWhereInput
  }

  /**
   * Conductor without action
   */
  export type ConductorDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Conductor
     */
    select?: ConductorSelect<ExtArgs> | null
  }


  /**
   * Model Emergency
   */

  export type AggregateEmergency = {
    _count: EmergencyCountAggregateOutputType | null
    _min: EmergencyMinAggregateOutputType | null
    _max: EmergencyMaxAggregateOutputType | null
  }

  export type EmergencyMinAggregateOutputType = {
    id: string | null
    busId: string | null
    driverName: string | null
    type: string | null
    notes: string | null
    status: string | null
    createdAt: Date | null
  }

  export type EmergencyMaxAggregateOutputType = {
    id: string | null
    busId: string | null
    driverName: string | null
    type: string | null
    notes: string | null
    status: string | null
    createdAt: Date | null
  }

  export type EmergencyCountAggregateOutputType = {
    id: number
    busId: number
    driverName: number
    type: number
    notes: number
    status: number
    createdAt: number
    _all: number
  }


  export type EmergencyMinAggregateInputType = {
    id?: true
    busId?: true
    driverName?: true
    type?: true
    notes?: true
    status?: true
    createdAt?: true
  }

  export type EmergencyMaxAggregateInputType = {
    id?: true
    busId?: true
    driverName?: true
    type?: true
    notes?: true
    status?: true
    createdAt?: true
  }

  export type EmergencyCountAggregateInputType = {
    id?: true
    busId?: true
    driverName?: true
    type?: true
    notes?: true
    status?: true
    createdAt?: true
    _all?: true
  }

  export type EmergencyAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Emergency to aggregate.
     */
    where?: EmergencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Emergencies to fetch.
     */
    orderBy?: EmergencyOrderByWithRelationInput | EmergencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: EmergencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Emergencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Emergencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Emergencies
    **/
    _count?: true | EmergencyCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: EmergencyMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: EmergencyMaxAggregateInputType
  }

  export type GetEmergencyAggregateType<T extends EmergencyAggregateArgs> = {
        [P in keyof T & keyof AggregateEmergency]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateEmergency[P]>
      : GetScalarType<T[P], AggregateEmergency[P]>
  }




  export type EmergencyGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: EmergencyWhereInput
    orderBy?: EmergencyOrderByWithAggregationInput | EmergencyOrderByWithAggregationInput[]
    by: EmergencyScalarFieldEnum[] | EmergencyScalarFieldEnum
    having?: EmergencyScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: EmergencyCountAggregateInputType | true
    _min?: EmergencyMinAggregateInputType
    _max?: EmergencyMaxAggregateInputType
  }

  export type EmergencyGroupByOutputType = {
    id: string
    busId: string
    driverName: string | null
    type: string
    notes: string | null
    status: string | null
    createdAt: Date
    _count: EmergencyCountAggregateOutputType | null
    _min: EmergencyMinAggregateOutputType | null
    _max: EmergencyMaxAggregateOutputType | null
  }

  type GetEmergencyGroupByPayload<T extends EmergencyGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<EmergencyGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof EmergencyGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], EmergencyGroupByOutputType[P]>
            : GetScalarType<T[P], EmergencyGroupByOutputType[P]>
        }
      >
    >


  export type EmergencySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busId?: boolean
    driverName?: boolean
    type?: boolean
    notes?: boolean
    status?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["emergency"]>

  export type EmergencySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busId?: boolean
    driverName?: boolean
    type?: boolean
    notes?: boolean
    status?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["emergency"]>

  export type EmergencySelectScalar = {
    id?: boolean
    busId?: boolean
    driverName?: boolean
    type?: boolean
    notes?: boolean
    status?: boolean
    createdAt?: boolean
  }


  export type $EmergencyPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Emergency"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      busId: string
      driverName: string | null
      type: string
      notes: string | null
      status: string | null
      createdAt: Date
    }, ExtArgs["result"]["emergency"]>
    composites: {}
  }

  type EmergencyGetPayload<S extends boolean | null | undefined | EmergencyDefaultArgs> = $Result.GetResult<Prisma.$EmergencyPayload, S>

  type EmergencyCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<EmergencyFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: EmergencyCountAggregateInputType | true
    }

  export interface EmergencyDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Emergency'], meta: { name: 'Emergency' } }
    /**
     * Find zero or one Emergency that matches the filter.
     * @param {EmergencyFindUniqueArgs} args - Arguments to find a Emergency
     * @example
     * // Get one Emergency
     * const emergency = await prisma.emergency.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends EmergencyFindUniqueArgs>(args: SelectSubset<T, EmergencyFindUniqueArgs<ExtArgs>>): Prisma__EmergencyClient<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Emergency that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {EmergencyFindUniqueOrThrowArgs} args - Arguments to find a Emergency
     * @example
     * // Get one Emergency
     * const emergency = await prisma.emergency.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends EmergencyFindUniqueOrThrowArgs>(args: SelectSubset<T, EmergencyFindUniqueOrThrowArgs<ExtArgs>>): Prisma__EmergencyClient<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Emergency that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyFindFirstArgs} args - Arguments to find a Emergency
     * @example
     * // Get one Emergency
     * const emergency = await prisma.emergency.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends EmergencyFindFirstArgs>(args?: SelectSubset<T, EmergencyFindFirstArgs<ExtArgs>>): Prisma__EmergencyClient<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Emergency that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyFindFirstOrThrowArgs} args - Arguments to find a Emergency
     * @example
     * // Get one Emergency
     * const emergency = await prisma.emergency.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends EmergencyFindFirstOrThrowArgs>(args?: SelectSubset<T, EmergencyFindFirstOrThrowArgs<ExtArgs>>): Prisma__EmergencyClient<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Emergencies that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Emergencies
     * const emergencies = await prisma.emergency.findMany()
     * 
     * // Get first 10 Emergencies
     * const emergencies = await prisma.emergency.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const emergencyWithIdOnly = await prisma.emergency.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends EmergencyFindManyArgs>(args?: SelectSubset<T, EmergencyFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Emergency.
     * @param {EmergencyCreateArgs} args - Arguments to create a Emergency.
     * @example
     * // Create one Emergency
     * const Emergency = await prisma.emergency.create({
     *   data: {
     *     // ... data to create a Emergency
     *   }
     * })
     * 
     */
    create<T extends EmergencyCreateArgs>(args: SelectSubset<T, EmergencyCreateArgs<ExtArgs>>): Prisma__EmergencyClient<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Emergencies.
     * @param {EmergencyCreateManyArgs} args - Arguments to create many Emergencies.
     * @example
     * // Create many Emergencies
     * const emergency = await prisma.emergency.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends EmergencyCreateManyArgs>(args?: SelectSubset<T, EmergencyCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Emergencies and returns the data saved in the database.
     * @param {EmergencyCreateManyAndReturnArgs} args - Arguments to create many Emergencies.
     * @example
     * // Create many Emergencies
     * const emergency = await prisma.emergency.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Emergencies and only return the `id`
     * const emergencyWithIdOnly = await prisma.emergency.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends EmergencyCreateManyAndReturnArgs>(args?: SelectSubset<T, EmergencyCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Emergency.
     * @param {EmergencyDeleteArgs} args - Arguments to delete one Emergency.
     * @example
     * // Delete one Emergency
     * const Emergency = await prisma.emergency.delete({
     *   where: {
     *     // ... filter to delete one Emergency
     *   }
     * })
     * 
     */
    delete<T extends EmergencyDeleteArgs>(args: SelectSubset<T, EmergencyDeleteArgs<ExtArgs>>): Prisma__EmergencyClient<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Emergency.
     * @param {EmergencyUpdateArgs} args - Arguments to update one Emergency.
     * @example
     * // Update one Emergency
     * const emergency = await prisma.emergency.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends EmergencyUpdateArgs>(args: SelectSubset<T, EmergencyUpdateArgs<ExtArgs>>): Prisma__EmergencyClient<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Emergencies.
     * @param {EmergencyDeleteManyArgs} args - Arguments to filter Emergencies to delete.
     * @example
     * // Delete a few Emergencies
     * const { count } = await prisma.emergency.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends EmergencyDeleteManyArgs>(args?: SelectSubset<T, EmergencyDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Emergencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Emergencies
     * const emergency = await prisma.emergency.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends EmergencyUpdateManyArgs>(args: SelectSubset<T, EmergencyUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Emergency.
     * @param {EmergencyUpsertArgs} args - Arguments to update or create a Emergency.
     * @example
     * // Update or create a Emergency
     * const emergency = await prisma.emergency.upsert({
     *   create: {
     *     // ... data to create a Emergency
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Emergency we want to update
     *   }
     * })
     */
    upsert<T extends EmergencyUpsertArgs>(args: SelectSubset<T, EmergencyUpsertArgs<ExtArgs>>): Prisma__EmergencyClient<$Result.GetResult<Prisma.$EmergencyPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Emergencies.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyCountArgs} args - Arguments to filter Emergencies to count.
     * @example
     * // Count the number of Emergencies
     * const count = await prisma.emergency.count({
     *   where: {
     *     // ... the filter for the Emergencies we want to count
     *   }
     * })
    **/
    count<T extends EmergencyCountArgs>(
      args?: Subset<T, EmergencyCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], EmergencyCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Emergency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends EmergencyAggregateArgs>(args: Subset<T, EmergencyAggregateArgs>): Prisma.PrismaPromise<GetEmergencyAggregateType<T>>

    /**
     * Group by Emergency.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {EmergencyGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends EmergencyGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: EmergencyGroupByArgs['orderBy'] }
        : { orderBy?: EmergencyGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, EmergencyGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmergencyGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Emergency model
   */
  readonly fields: EmergencyFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Emergency.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__EmergencyClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Emergency model
   */ 
  interface EmergencyFieldRefs {
    readonly id: FieldRef<"Emergency", 'String'>
    readonly busId: FieldRef<"Emergency", 'String'>
    readonly driverName: FieldRef<"Emergency", 'String'>
    readonly type: FieldRef<"Emergency", 'String'>
    readonly notes: FieldRef<"Emergency", 'String'>
    readonly status: FieldRef<"Emergency", 'String'>
    readonly createdAt: FieldRef<"Emergency", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Emergency findUnique
   */
  export type EmergencyFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * Filter, which Emergency to fetch.
     */
    where: EmergencyWhereUniqueInput
  }

  /**
   * Emergency findUniqueOrThrow
   */
  export type EmergencyFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * Filter, which Emergency to fetch.
     */
    where: EmergencyWhereUniqueInput
  }

  /**
   * Emergency findFirst
   */
  export type EmergencyFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * Filter, which Emergency to fetch.
     */
    where?: EmergencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Emergencies to fetch.
     */
    orderBy?: EmergencyOrderByWithRelationInput | EmergencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Emergencies.
     */
    cursor?: EmergencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Emergencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Emergencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Emergencies.
     */
    distinct?: EmergencyScalarFieldEnum | EmergencyScalarFieldEnum[]
  }

  /**
   * Emergency findFirstOrThrow
   */
  export type EmergencyFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * Filter, which Emergency to fetch.
     */
    where?: EmergencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Emergencies to fetch.
     */
    orderBy?: EmergencyOrderByWithRelationInput | EmergencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Emergencies.
     */
    cursor?: EmergencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Emergencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Emergencies.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Emergencies.
     */
    distinct?: EmergencyScalarFieldEnum | EmergencyScalarFieldEnum[]
  }

  /**
   * Emergency findMany
   */
  export type EmergencyFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * Filter, which Emergencies to fetch.
     */
    where?: EmergencyWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Emergencies to fetch.
     */
    orderBy?: EmergencyOrderByWithRelationInput | EmergencyOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Emergencies.
     */
    cursor?: EmergencyWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Emergencies from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Emergencies.
     */
    skip?: number
    distinct?: EmergencyScalarFieldEnum | EmergencyScalarFieldEnum[]
  }

  /**
   * Emergency create
   */
  export type EmergencyCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * The data needed to create a Emergency.
     */
    data: XOR<EmergencyCreateInput, EmergencyUncheckedCreateInput>
  }

  /**
   * Emergency createMany
   */
  export type EmergencyCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Emergencies.
     */
    data: EmergencyCreateManyInput | EmergencyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Emergency createManyAndReturn
   */
  export type EmergencyCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Emergencies.
     */
    data: EmergencyCreateManyInput | EmergencyCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Emergency update
   */
  export type EmergencyUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * The data needed to update a Emergency.
     */
    data: XOR<EmergencyUpdateInput, EmergencyUncheckedUpdateInput>
    /**
     * Choose, which Emergency to update.
     */
    where: EmergencyWhereUniqueInput
  }

  /**
   * Emergency updateMany
   */
  export type EmergencyUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Emergencies.
     */
    data: XOR<EmergencyUpdateManyMutationInput, EmergencyUncheckedUpdateManyInput>
    /**
     * Filter which Emergencies to update
     */
    where?: EmergencyWhereInput
  }

  /**
   * Emergency upsert
   */
  export type EmergencyUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * The filter to search for the Emergency to update in case it exists.
     */
    where: EmergencyWhereUniqueInput
    /**
     * In case the Emergency found by the `where` argument doesn't exist, create a new Emergency with this data.
     */
    create: XOR<EmergencyCreateInput, EmergencyUncheckedCreateInput>
    /**
     * In case the Emergency was found with the provided `where` argument, update it with this data.
     */
    update: XOR<EmergencyUpdateInput, EmergencyUncheckedUpdateInput>
  }

  /**
   * Emergency delete
   */
  export type EmergencyDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
    /**
     * Filter which Emergency to delete.
     */
    where: EmergencyWhereUniqueInput
  }

  /**
   * Emergency deleteMany
   */
  export type EmergencyDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Emergencies to delete
     */
    where?: EmergencyWhereInput
  }

  /**
   * Emergency without action
   */
  export type EmergencyDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Emergency
     */
    select?: EmergencySelect<ExtArgs> | null
  }


  /**
   * Model Student
   */

  export type AggregateStudent = {
    _count: StudentCountAggregateOutputType | null
    _min: StudentMinAggregateOutputType | null
    _max: StudentMaxAggregateOutputType | null
  }

  export type StudentMinAggregateOutputType = {
    id: string | null
    name: string | null
    admissionNo: string | null
    busId: string | null
    parentPhone: string | null
    stopId: string | null
    class: string | null
    createdAt: Date | null
    dropStopId: string | null
    parentPhone2: string | null
    fatherName: string | null
    motherName: string | null
  }

  export type StudentMaxAggregateOutputType = {
    id: string | null
    name: string | null
    admissionNo: string | null
    busId: string | null
    parentPhone: string | null
    stopId: string | null
    class: string | null
    createdAt: Date | null
    dropStopId: string | null
    parentPhone2: string | null
    fatherName: string | null
    motherName: string | null
  }

  export type StudentCountAggregateOutputType = {
    id: number
    name: number
    admissionNo: number
    busId: number
    parentPhone: number
    stopId: number
    class: number
    createdAt: number
    dropStopId: number
    parentPhone2: number
    fatherName: number
    motherName: number
    _all: number
  }


  export type StudentMinAggregateInputType = {
    id?: true
    name?: true
    admissionNo?: true
    busId?: true
    parentPhone?: true
    stopId?: true
    class?: true
    createdAt?: true
    dropStopId?: true
    parentPhone2?: true
    fatherName?: true
    motherName?: true
  }

  export type StudentMaxAggregateInputType = {
    id?: true
    name?: true
    admissionNo?: true
    busId?: true
    parentPhone?: true
    stopId?: true
    class?: true
    createdAt?: true
    dropStopId?: true
    parentPhone2?: true
    fatherName?: true
    motherName?: true
  }

  export type StudentCountAggregateInputType = {
    id?: true
    name?: true
    admissionNo?: true
    busId?: true
    parentPhone?: true
    stopId?: true
    class?: true
    createdAt?: true
    dropStopId?: true
    parentPhone2?: true
    fatherName?: true
    motherName?: true
    _all?: true
  }

  export type StudentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Student to aggregate.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Students
    **/
    _count?: true | StudentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StudentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StudentMaxAggregateInputType
  }

  export type GetStudentAggregateType<T extends StudentAggregateArgs> = {
        [P in keyof T & keyof AggregateStudent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStudent[P]>
      : GetScalarType<T[P], AggregateStudent[P]>
  }




  export type StudentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StudentWhereInput
    orderBy?: StudentOrderByWithAggregationInput | StudentOrderByWithAggregationInput[]
    by: StudentScalarFieldEnum[] | StudentScalarFieldEnum
    having?: StudentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StudentCountAggregateInputType | true
    _min?: StudentMinAggregateInputType
    _max?: StudentMaxAggregateInputType
  }

  export type StudentGroupByOutputType = {
    id: string
    name: string
    admissionNo: string
    busId: string
    parentPhone: string
    stopId: string | null
    class: string | null
    createdAt: Date
    dropStopId: string | null
    parentPhone2: string | null
    fatherName: string | null
    motherName: string | null
    _count: StudentCountAggregateOutputType | null
    _min: StudentMinAggregateOutputType | null
    _max: StudentMaxAggregateOutputType | null
  }

  type GetStudentGroupByPayload<T extends StudentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StudentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StudentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StudentGroupByOutputType[P]>
            : GetScalarType<T[P], StudentGroupByOutputType[P]>
        }
      >
    >


  export type StudentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    admissionNo?: boolean
    busId?: boolean
    parentPhone?: boolean
    stopId?: boolean
    class?: boolean
    createdAt?: boolean
    dropStopId?: boolean
    parentPhone2?: boolean
    fatherName?: boolean
    motherName?: boolean
  }, ExtArgs["result"]["student"]>

  export type StudentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    admissionNo?: boolean
    busId?: boolean
    parentPhone?: boolean
    stopId?: boolean
    class?: boolean
    createdAt?: boolean
    dropStopId?: boolean
    parentPhone2?: boolean
    fatherName?: boolean
    motherName?: boolean
  }, ExtArgs["result"]["student"]>

  export type StudentSelectScalar = {
    id?: boolean
    name?: boolean
    admissionNo?: boolean
    busId?: boolean
    parentPhone?: boolean
    stopId?: boolean
    class?: boolean
    createdAt?: boolean
    dropStopId?: boolean
    parentPhone2?: boolean
    fatherName?: boolean
    motherName?: boolean
  }


  export type $StudentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Student"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      admissionNo: string
      busId: string
      parentPhone: string
      stopId: string | null
      class: string | null
      createdAt: Date
      dropStopId: string | null
      parentPhone2: string | null
      fatherName: string | null
      motherName: string | null
    }, ExtArgs["result"]["student"]>
    composites: {}
  }

  type StudentGetPayload<S extends boolean | null | undefined | StudentDefaultArgs> = $Result.GetResult<Prisma.$StudentPayload, S>

  type StudentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StudentFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StudentCountAggregateInputType | true
    }

  export interface StudentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Student'], meta: { name: 'Student' } }
    /**
     * Find zero or one Student that matches the filter.
     * @param {StudentFindUniqueArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StudentFindUniqueArgs>(args: SelectSubset<T, StudentFindUniqueArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Student that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StudentFindUniqueOrThrowArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StudentFindUniqueOrThrowArgs>(args: SelectSubset<T, StudentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Student that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindFirstArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StudentFindFirstArgs>(args?: SelectSubset<T, StudentFindFirstArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Student that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindFirstOrThrowArgs} args - Arguments to find a Student
     * @example
     * // Get one Student
     * const student = await prisma.student.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StudentFindFirstOrThrowArgs>(args?: SelectSubset<T, StudentFindFirstOrThrowArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Students that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Students
     * const students = await prisma.student.findMany()
     * 
     * // Get first 10 Students
     * const students = await prisma.student.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const studentWithIdOnly = await prisma.student.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StudentFindManyArgs>(args?: SelectSubset<T, StudentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Student.
     * @param {StudentCreateArgs} args - Arguments to create a Student.
     * @example
     * // Create one Student
     * const Student = await prisma.student.create({
     *   data: {
     *     // ... data to create a Student
     *   }
     * })
     * 
     */
    create<T extends StudentCreateArgs>(args: SelectSubset<T, StudentCreateArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Students.
     * @param {StudentCreateManyArgs} args - Arguments to create many Students.
     * @example
     * // Create many Students
     * const student = await prisma.student.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StudentCreateManyArgs>(args?: SelectSubset<T, StudentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Students and returns the data saved in the database.
     * @param {StudentCreateManyAndReturnArgs} args - Arguments to create many Students.
     * @example
     * // Create many Students
     * const student = await prisma.student.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Students and only return the `id`
     * const studentWithIdOnly = await prisma.student.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StudentCreateManyAndReturnArgs>(args?: SelectSubset<T, StudentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Student.
     * @param {StudentDeleteArgs} args - Arguments to delete one Student.
     * @example
     * // Delete one Student
     * const Student = await prisma.student.delete({
     *   where: {
     *     // ... filter to delete one Student
     *   }
     * })
     * 
     */
    delete<T extends StudentDeleteArgs>(args: SelectSubset<T, StudentDeleteArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Student.
     * @param {StudentUpdateArgs} args - Arguments to update one Student.
     * @example
     * // Update one Student
     * const student = await prisma.student.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StudentUpdateArgs>(args: SelectSubset<T, StudentUpdateArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Students.
     * @param {StudentDeleteManyArgs} args - Arguments to filter Students to delete.
     * @example
     * // Delete a few Students
     * const { count } = await prisma.student.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StudentDeleteManyArgs>(args?: SelectSubset<T, StudentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Students.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Students
     * const student = await prisma.student.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StudentUpdateManyArgs>(args: SelectSubset<T, StudentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Student.
     * @param {StudentUpsertArgs} args - Arguments to update or create a Student.
     * @example
     * // Update or create a Student
     * const student = await prisma.student.upsert({
     *   create: {
     *     // ... data to create a Student
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Student we want to update
     *   }
     * })
     */
    upsert<T extends StudentUpsertArgs>(args: SelectSubset<T, StudentUpsertArgs<ExtArgs>>): Prisma__StudentClient<$Result.GetResult<Prisma.$StudentPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Students.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentCountArgs} args - Arguments to filter Students to count.
     * @example
     * // Count the number of Students
     * const count = await prisma.student.count({
     *   where: {
     *     // ... the filter for the Students we want to count
     *   }
     * })
    **/
    count<T extends StudentCountArgs>(
      args?: Subset<T, StudentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StudentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Student.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StudentAggregateArgs>(args: Subset<T, StudentAggregateArgs>): Prisma.PrismaPromise<GetStudentAggregateType<T>>

    /**
     * Group by Student.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StudentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StudentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StudentGroupByArgs['orderBy'] }
        : { orderBy?: StudentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StudentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStudentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Student model
   */
  readonly fields: StudentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Student.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StudentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Student model
   */ 
  interface StudentFieldRefs {
    readonly id: FieldRef<"Student", 'String'>
    readonly name: FieldRef<"Student", 'String'>
    readonly admissionNo: FieldRef<"Student", 'String'>
    readonly busId: FieldRef<"Student", 'String'>
    readonly parentPhone: FieldRef<"Student", 'String'>
    readonly stopId: FieldRef<"Student", 'String'>
    readonly class: FieldRef<"Student", 'String'>
    readonly createdAt: FieldRef<"Student", 'DateTime'>
    readonly dropStopId: FieldRef<"Student", 'String'>
    readonly parentPhone2: FieldRef<"Student", 'String'>
    readonly fatherName: FieldRef<"Student", 'String'>
    readonly motherName: FieldRef<"Student", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Student findUnique
   */
  export type StudentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student findUniqueOrThrow
   */
  export type StudentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student findFirst
   */
  export type StudentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Students.
     */
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student findFirstOrThrow
   */
  export type StudentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Filter, which Student to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Students.
     */
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student findMany
   */
  export type StudentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Filter, which Students to fetch.
     */
    where?: StudentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Students to fetch.
     */
    orderBy?: StudentOrderByWithRelationInput | StudentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Students.
     */
    cursor?: StudentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Students from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Students.
     */
    skip?: number
    distinct?: StudentScalarFieldEnum | StudentScalarFieldEnum[]
  }

  /**
   * Student create
   */
  export type StudentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * The data needed to create a Student.
     */
    data: XOR<StudentCreateInput, StudentUncheckedCreateInput>
  }

  /**
   * Student createMany
   */
  export type StudentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Students.
     */
    data: StudentCreateManyInput | StudentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Student createManyAndReturn
   */
  export type StudentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Students.
     */
    data: StudentCreateManyInput | StudentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Student update
   */
  export type StudentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * The data needed to update a Student.
     */
    data: XOR<StudentUpdateInput, StudentUncheckedUpdateInput>
    /**
     * Choose, which Student to update.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student updateMany
   */
  export type StudentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Students.
     */
    data: XOR<StudentUpdateManyMutationInput, StudentUncheckedUpdateManyInput>
    /**
     * Filter which Students to update
     */
    where?: StudentWhereInput
  }

  /**
   * Student upsert
   */
  export type StudentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * The filter to search for the Student to update in case it exists.
     */
    where: StudentWhereUniqueInput
    /**
     * In case the Student found by the `where` argument doesn't exist, create a new Student with this data.
     */
    create: XOR<StudentCreateInput, StudentUncheckedCreateInput>
    /**
     * In case the Student was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StudentUpdateInput, StudentUncheckedUpdateInput>
  }

  /**
   * Student delete
   */
  export type StudentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
    /**
     * Filter which Student to delete.
     */
    where: StudentWhereUniqueInput
  }

  /**
   * Student deleteMany
   */
  export type StudentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Students to delete
     */
    where?: StudentWhereInput
  }

  /**
   * Student without action
   */
  export type StudentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Student
     */
    select?: StudentSelect<ExtArgs> | null
  }


  /**
   * Model Route
   */

  export type AggregateRoute = {
    _count: RouteCountAggregateOutputType | null
    _min: RouteMinAggregateOutputType | null
    _max: RouteMaxAggregateOutputType | null
  }

  export type RouteMinAggregateOutputType = {
    id: string | null
    name: string | null
    busId: string | null
    startPoint: string | null
    endPoint: string | null
    createdAt: Date | null
  }

  export type RouteMaxAggregateOutputType = {
    id: string | null
    name: string | null
    busId: string | null
    startPoint: string | null
    endPoint: string | null
    createdAt: Date | null
  }

  export type RouteCountAggregateOutputType = {
    id: number
    name: number
    busId: number
    startPoint: number
    endPoint: number
    createdAt: number
    _all: number
  }


  export type RouteMinAggregateInputType = {
    id?: true
    name?: true
    busId?: true
    startPoint?: true
    endPoint?: true
    createdAt?: true
  }

  export type RouteMaxAggregateInputType = {
    id?: true
    name?: true
    busId?: true
    startPoint?: true
    endPoint?: true
    createdAt?: true
  }

  export type RouteCountAggregateInputType = {
    id?: true
    name?: true
    busId?: true
    startPoint?: true
    endPoint?: true
    createdAt?: true
    _all?: true
  }

  export type RouteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Route to aggregate.
     */
    where?: RouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routes to fetch.
     */
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Routes
    **/
    _count?: true | RouteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RouteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RouteMaxAggregateInputType
  }

  export type GetRouteAggregateType<T extends RouteAggregateArgs> = {
        [P in keyof T & keyof AggregateRoute]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRoute[P]>
      : GetScalarType<T[P], AggregateRoute[P]>
  }




  export type RouteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RouteWhereInput
    orderBy?: RouteOrderByWithAggregationInput | RouteOrderByWithAggregationInput[]
    by: RouteScalarFieldEnum[] | RouteScalarFieldEnum
    having?: RouteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RouteCountAggregateInputType | true
    _min?: RouteMinAggregateInputType
    _max?: RouteMaxAggregateInputType
  }

  export type RouteGroupByOutputType = {
    id: string
    name: string
    busId: string
    startPoint: string
    endPoint: string | null
    createdAt: Date
    _count: RouteCountAggregateOutputType | null
    _min: RouteMinAggregateOutputType | null
    _max: RouteMaxAggregateOutputType | null
  }

  type GetRouteGroupByPayload<T extends RouteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RouteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RouteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RouteGroupByOutputType[P]>
            : GetScalarType<T[P], RouteGroupByOutputType[P]>
        }
      >
    >


  export type RouteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    busId?: boolean
    startPoint?: boolean
    endPoint?: boolean
    createdAt?: boolean
    stops?: boolean | Route$stopsArgs<ExtArgs>
    _count?: boolean | RouteCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["route"]>

  export type RouteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    busId?: boolean
    startPoint?: boolean
    endPoint?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["route"]>

  export type RouteSelectScalar = {
    id?: boolean
    name?: boolean
    busId?: boolean
    startPoint?: boolean
    endPoint?: boolean
    createdAt?: boolean
  }

  export type RouteInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stops?: boolean | Route$stopsArgs<ExtArgs>
    _count?: boolean | RouteCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type RouteIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $RoutePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Route"
    objects: {
      stops: Prisma.$RouteStopPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      busId: string
      startPoint: string
      endPoint: string | null
      createdAt: Date
    }, ExtArgs["result"]["route"]>
    composites: {}
  }

  type RouteGetPayload<S extends boolean | null | undefined | RouteDefaultArgs> = $Result.GetResult<Prisma.$RoutePayload, S>

  type RouteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RouteFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RouteCountAggregateInputType | true
    }

  export interface RouteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Route'], meta: { name: 'Route' } }
    /**
     * Find zero or one Route that matches the filter.
     * @param {RouteFindUniqueArgs} args - Arguments to find a Route
     * @example
     * // Get one Route
     * const route = await prisma.route.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RouteFindUniqueArgs>(args: SelectSubset<T, RouteFindUniqueArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Route that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RouteFindUniqueOrThrowArgs} args - Arguments to find a Route
     * @example
     * // Get one Route
     * const route = await prisma.route.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RouteFindUniqueOrThrowArgs>(args: SelectSubset<T, RouteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Route that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteFindFirstArgs} args - Arguments to find a Route
     * @example
     * // Get one Route
     * const route = await prisma.route.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RouteFindFirstArgs>(args?: SelectSubset<T, RouteFindFirstArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Route that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteFindFirstOrThrowArgs} args - Arguments to find a Route
     * @example
     * // Get one Route
     * const route = await prisma.route.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RouteFindFirstOrThrowArgs>(args?: SelectSubset<T, RouteFindFirstOrThrowArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Routes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Routes
     * const routes = await prisma.route.findMany()
     * 
     * // Get first 10 Routes
     * const routes = await prisma.route.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const routeWithIdOnly = await prisma.route.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RouteFindManyArgs>(args?: SelectSubset<T, RouteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Route.
     * @param {RouteCreateArgs} args - Arguments to create a Route.
     * @example
     * // Create one Route
     * const Route = await prisma.route.create({
     *   data: {
     *     // ... data to create a Route
     *   }
     * })
     * 
     */
    create<T extends RouteCreateArgs>(args: SelectSubset<T, RouteCreateArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Routes.
     * @param {RouteCreateManyArgs} args - Arguments to create many Routes.
     * @example
     * // Create many Routes
     * const route = await prisma.route.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RouteCreateManyArgs>(args?: SelectSubset<T, RouteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Routes and returns the data saved in the database.
     * @param {RouteCreateManyAndReturnArgs} args - Arguments to create many Routes.
     * @example
     * // Create many Routes
     * const route = await prisma.route.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Routes and only return the `id`
     * const routeWithIdOnly = await prisma.route.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RouteCreateManyAndReturnArgs>(args?: SelectSubset<T, RouteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Route.
     * @param {RouteDeleteArgs} args - Arguments to delete one Route.
     * @example
     * // Delete one Route
     * const Route = await prisma.route.delete({
     *   where: {
     *     // ... filter to delete one Route
     *   }
     * })
     * 
     */
    delete<T extends RouteDeleteArgs>(args: SelectSubset<T, RouteDeleteArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Route.
     * @param {RouteUpdateArgs} args - Arguments to update one Route.
     * @example
     * // Update one Route
     * const route = await prisma.route.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RouteUpdateArgs>(args: SelectSubset<T, RouteUpdateArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Routes.
     * @param {RouteDeleteManyArgs} args - Arguments to filter Routes to delete.
     * @example
     * // Delete a few Routes
     * const { count } = await prisma.route.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RouteDeleteManyArgs>(args?: SelectSubset<T, RouteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Routes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Routes
     * const route = await prisma.route.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RouteUpdateManyArgs>(args: SelectSubset<T, RouteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Route.
     * @param {RouteUpsertArgs} args - Arguments to update or create a Route.
     * @example
     * // Update or create a Route
     * const route = await prisma.route.upsert({
     *   create: {
     *     // ... data to create a Route
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Route we want to update
     *   }
     * })
     */
    upsert<T extends RouteUpsertArgs>(args: SelectSubset<T, RouteUpsertArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Routes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteCountArgs} args - Arguments to filter Routes to count.
     * @example
     * // Count the number of Routes
     * const count = await prisma.route.count({
     *   where: {
     *     // ... the filter for the Routes we want to count
     *   }
     * })
    **/
    count<T extends RouteCountArgs>(
      args?: Subset<T, RouteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RouteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Route.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RouteAggregateArgs>(args: Subset<T, RouteAggregateArgs>): Prisma.PrismaPromise<GetRouteAggregateType<T>>

    /**
     * Group by Route.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RouteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RouteGroupByArgs['orderBy'] }
        : { orderBy?: RouteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RouteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRouteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Route model
   */
  readonly fields: RouteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Route.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RouteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    stops<T extends Route$stopsArgs<ExtArgs> = {}>(args?: Subset<T, Route$stopsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Route model
   */ 
  interface RouteFieldRefs {
    readonly id: FieldRef<"Route", 'String'>
    readonly name: FieldRef<"Route", 'String'>
    readonly busId: FieldRef<"Route", 'String'>
    readonly startPoint: FieldRef<"Route", 'String'>
    readonly endPoint: FieldRef<"Route", 'String'>
    readonly createdAt: FieldRef<"Route", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Route findUnique
   */
  export type RouteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Route to fetch.
     */
    where: RouteWhereUniqueInput
  }

  /**
   * Route findUniqueOrThrow
   */
  export type RouteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Route to fetch.
     */
    where: RouteWhereUniqueInput
  }

  /**
   * Route findFirst
   */
  export type RouteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Route to fetch.
     */
    where?: RouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routes to fetch.
     */
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Routes.
     */
    cursor?: RouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Routes.
     */
    distinct?: RouteScalarFieldEnum | RouteScalarFieldEnum[]
  }

  /**
   * Route findFirstOrThrow
   */
  export type RouteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Route to fetch.
     */
    where?: RouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routes to fetch.
     */
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Routes.
     */
    cursor?: RouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Routes.
     */
    distinct?: RouteScalarFieldEnum | RouteScalarFieldEnum[]
  }

  /**
   * Route findMany
   */
  export type RouteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter, which Routes to fetch.
     */
    where?: RouteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Routes to fetch.
     */
    orderBy?: RouteOrderByWithRelationInput | RouteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Routes.
     */
    cursor?: RouteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Routes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Routes.
     */
    skip?: number
    distinct?: RouteScalarFieldEnum | RouteScalarFieldEnum[]
  }

  /**
   * Route create
   */
  export type RouteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * The data needed to create a Route.
     */
    data: XOR<RouteCreateInput, RouteUncheckedCreateInput>
  }

  /**
   * Route createMany
   */
  export type RouteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Routes.
     */
    data: RouteCreateManyInput | RouteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Route createManyAndReturn
   */
  export type RouteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Routes.
     */
    data: RouteCreateManyInput | RouteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Route update
   */
  export type RouteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * The data needed to update a Route.
     */
    data: XOR<RouteUpdateInput, RouteUncheckedUpdateInput>
    /**
     * Choose, which Route to update.
     */
    where: RouteWhereUniqueInput
  }

  /**
   * Route updateMany
   */
  export type RouteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Routes.
     */
    data: XOR<RouteUpdateManyMutationInput, RouteUncheckedUpdateManyInput>
    /**
     * Filter which Routes to update
     */
    where?: RouteWhereInput
  }

  /**
   * Route upsert
   */
  export type RouteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * The filter to search for the Route to update in case it exists.
     */
    where: RouteWhereUniqueInput
    /**
     * In case the Route found by the `where` argument doesn't exist, create a new Route with this data.
     */
    create: XOR<RouteCreateInput, RouteUncheckedCreateInput>
    /**
     * In case the Route was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RouteUpdateInput, RouteUncheckedUpdateInput>
  }

  /**
   * Route delete
   */
  export type RouteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
    /**
     * Filter which Route to delete.
     */
    where: RouteWhereUniqueInput
  }

  /**
   * Route deleteMany
   */
  export type RouteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Routes to delete
     */
    where?: RouteWhereInput
  }

  /**
   * Route.stops
   */
  export type Route$stopsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    where?: RouteStopWhereInput
    orderBy?: RouteStopOrderByWithRelationInput | RouteStopOrderByWithRelationInput[]
    cursor?: RouteStopWhereUniqueInput
    take?: number
    skip?: number
    distinct?: RouteStopScalarFieldEnum | RouteStopScalarFieldEnum[]
  }

  /**
   * Route without action
   */
  export type RouteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Route
     */
    select?: RouteSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteInclude<ExtArgs> | null
  }


  /**
   * Model RouteStop
   */

  export type AggregateRouteStop = {
    _count: RouteStopCountAggregateOutputType | null
    _avg: RouteStopAvgAggregateOutputType | null
    _sum: RouteStopSumAggregateOutputType | null
    _min: RouteStopMinAggregateOutputType | null
    _max: RouteStopMaxAggregateOutputType | null
  }

  export type RouteStopAvgAggregateOutputType = {
    lat: number | null
    lng: number | null
    order: number | null
    distanceFromStart: number | null
    estimatedTime: number | null
  }

  export type RouteStopSumAggregateOutputType = {
    lat: number | null
    lng: number | null
    order: number | null
    distanceFromStart: number | null
    estimatedTime: number | null
  }

  export type RouteStopMinAggregateOutputType = {
    id: string | null
    routeId: string | null
    name: string | null
    lat: number | null
    lng: number | null
    order: number | null
    distanceFromStart: number | null
    estimatedTime: number | null
    createdAt: Date | null
  }

  export type RouteStopMaxAggregateOutputType = {
    id: string | null
    routeId: string | null
    name: string | null
    lat: number | null
    lng: number | null
    order: number | null
    distanceFromStart: number | null
    estimatedTime: number | null
    createdAt: Date | null
  }

  export type RouteStopCountAggregateOutputType = {
    id: number
    routeId: number
    name: number
    lat: number
    lng: number
    order: number
    distanceFromStart: number
    estimatedTime: number
    createdAt: number
    _all: number
  }


  export type RouteStopAvgAggregateInputType = {
    lat?: true
    lng?: true
    order?: true
    distanceFromStart?: true
    estimatedTime?: true
  }

  export type RouteStopSumAggregateInputType = {
    lat?: true
    lng?: true
    order?: true
    distanceFromStart?: true
    estimatedTime?: true
  }

  export type RouteStopMinAggregateInputType = {
    id?: true
    routeId?: true
    name?: true
    lat?: true
    lng?: true
    order?: true
    distanceFromStart?: true
    estimatedTime?: true
    createdAt?: true
  }

  export type RouteStopMaxAggregateInputType = {
    id?: true
    routeId?: true
    name?: true
    lat?: true
    lng?: true
    order?: true
    distanceFromStart?: true
    estimatedTime?: true
    createdAt?: true
  }

  export type RouteStopCountAggregateInputType = {
    id?: true
    routeId?: true
    name?: true
    lat?: true
    lng?: true
    order?: true
    distanceFromStart?: true
    estimatedTime?: true
    createdAt?: true
    _all?: true
  }

  export type RouteStopAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RouteStop to aggregate.
     */
    where?: RouteStopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RouteStops to fetch.
     */
    orderBy?: RouteStopOrderByWithRelationInput | RouteStopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RouteStopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RouteStops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RouteStops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned RouteStops
    **/
    _count?: true | RouteStopCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RouteStopAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RouteStopSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RouteStopMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RouteStopMaxAggregateInputType
  }

  export type GetRouteStopAggregateType<T extends RouteStopAggregateArgs> = {
        [P in keyof T & keyof AggregateRouteStop]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRouteStop[P]>
      : GetScalarType<T[P], AggregateRouteStop[P]>
  }




  export type RouteStopGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RouteStopWhereInput
    orderBy?: RouteStopOrderByWithAggregationInput | RouteStopOrderByWithAggregationInput[]
    by: RouteStopScalarFieldEnum[] | RouteStopScalarFieldEnum
    having?: RouteStopScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RouteStopCountAggregateInputType | true
    _avg?: RouteStopAvgAggregateInputType
    _sum?: RouteStopSumAggregateInputType
    _min?: RouteStopMinAggregateInputType
    _max?: RouteStopMaxAggregateInputType
  }

  export type RouteStopGroupByOutputType = {
    id: string
    routeId: string
    name: string
    lat: number
    lng: number
    order: number
    distanceFromStart: number
    estimatedTime: number
    createdAt: Date
    _count: RouteStopCountAggregateOutputType | null
    _avg: RouteStopAvgAggregateOutputType | null
    _sum: RouteStopSumAggregateOutputType | null
    _min: RouteStopMinAggregateOutputType | null
    _max: RouteStopMaxAggregateOutputType | null
  }

  type GetRouteStopGroupByPayload<T extends RouteStopGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RouteStopGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RouteStopGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RouteStopGroupByOutputType[P]>
            : GetScalarType<T[P], RouteStopGroupByOutputType[P]>
        }
      >
    >


  export type RouteStopSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    routeId?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    order?: boolean
    distanceFromStart?: boolean
    estimatedTime?: boolean
    createdAt?: boolean
    route?: boolean | RouteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["routeStop"]>

  export type RouteStopSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    routeId?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    order?: boolean
    distanceFromStart?: boolean
    estimatedTime?: boolean
    createdAt?: boolean
    route?: boolean | RouteDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["routeStop"]>

  export type RouteStopSelectScalar = {
    id?: boolean
    routeId?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    order?: boolean
    distanceFromStart?: boolean
    estimatedTime?: boolean
    createdAt?: boolean
  }

  export type RouteStopInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    route?: boolean | RouteDefaultArgs<ExtArgs>
  }
  export type RouteStopIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    route?: boolean | RouteDefaultArgs<ExtArgs>
  }

  export type $RouteStopPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "RouteStop"
    objects: {
      route: Prisma.$RoutePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      routeId: string
      name: string
      lat: number
      lng: number
      order: number
      distanceFromStart: number
      estimatedTime: number
      createdAt: Date
    }, ExtArgs["result"]["routeStop"]>
    composites: {}
  }

  type RouteStopGetPayload<S extends boolean | null | undefined | RouteStopDefaultArgs> = $Result.GetResult<Prisma.$RouteStopPayload, S>

  type RouteStopCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<RouteStopFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: RouteStopCountAggregateInputType | true
    }

  export interface RouteStopDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['RouteStop'], meta: { name: 'RouteStop' } }
    /**
     * Find zero or one RouteStop that matches the filter.
     * @param {RouteStopFindUniqueArgs} args - Arguments to find a RouteStop
     * @example
     * // Get one RouteStop
     * const routeStop = await prisma.routeStop.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RouteStopFindUniqueArgs>(args: SelectSubset<T, RouteStopFindUniqueArgs<ExtArgs>>): Prisma__RouteStopClient<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one RouteStop that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {RouteStopFindUniqueOrThrowArgs} args - Arguments to find a RouteStop
     * @example
     * // Get one RouteStop
     * const routeStop = await prisma.routeStop.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RouteStopFindUniqueOrThrowArgs>(args: SelectSubset<T, RouteStopFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RouteStopClient<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first RouteStop that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteStopFindFirstArgs} args - Arguments to find a RouteStop
     * @example
     * // Get one RouteStop
     * const routeStop = await prisma.routeStop.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RouteStopFindFirstArgs>(args?: SelectSubset<T, RouteStopFindFirstArgs<ExtArgs>>): Prisma__RouteStopClient<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first RouteStop that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteStopFindFirstOrThrowArgs} args - Arguments to find a RouteStop
     * @example
     * // Get one RouteStop
     * const routeStop = await prisma.routeStop.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RouteStopFindFirstOrThrowArgs>(args?: SelectSubset<T, RouteStopFindFirstOrThrowArgs<ExtArgs>>): Prisma__RouteStopClient<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more RouteStops that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteStopFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all RouteStops
     * const routeStops = await prisma.routeStop.findMany()
     * 
     * // Get first 10 RouteStops
     * const routeStops = await prisma.routeStop.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const routeStopWithIdOnly = await prisma.routeStop.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RouteStopFindManyArgs>(args?: SelectSubset<T, RouteStopFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a RouteStop.
     * @param {RouteStopCreateArgs} args - Arguments to create a RouteStop.
     * @example
     * // Create one RouteStop
     * const RouteStop = await prisma.routeStop.create({
     *   data: {
     *     // ... data to create a RouteStop
     *   }
     * })
     * 
     */
    create<T extends RouteStopCreateArgs>(args: SelectSubset<T, RouteStopCreateArgs<ExtArgs>>): Prisma__RouteStopClient<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many RouteStops.
     * @param {RouteStopCreateManyArgs} args - Arguments to create many RouteStops.
     * @example
     * // Create many RouteStops
     * const routeStop = await prisma.routeStop.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RouteStopCreateManyArgs>(args?: SelectSubset<T, RouteStopCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many RouteStops and returns the data saved in the database.
     * @param {RouteStopCreateManyAndReturnArgs} args - Arguments to create many RouteStops.
     * @example
     * // Create many RouteStops
     * const routeStop = await prisma.routeStop.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many RouteStops and only return the `id`
     * const routeStopWithIdOnly = await prisma.routeStop.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RouteStopCreateManyAndReturnArgs>(args?: SelectSubset<T, RouteStopCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a RouteStop.
     * @param {RouteStopDeleteArgs} args - Arguments to delete one RouteStop.
     * @example
     * // Delete one RouteStop
     * const RouteStop = await prisma.routeStop.delete({
     *   where: {
     *     // ... filter to delete one RouteStop
     *   }
     * })
     * 
     */
    delete<T extends RouteStopDeleteArgs>(args: SelectSubset<T, RouteStopDeleteArgs<ExtArgs>>): Prisma__RouteStopClient<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one RouteStop.
     * @param {RouteStopUpdateArgs} args - Arguments to update one RouteStop.
     * @example
     * // Update one RouteStop
     * const routeStop = await prisma.routeStop.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RouteStopUpdateArgs>(args: SelectSubset<T, RouteStopUpdateArgs<ExtArgs>>): Prisma__RouteStopClient<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more RouteStops.
     * @param {RouteStopDeleteManyArgs} args - Arguments to filter RouteStops to delete.
     * @example
     * // Delete a few RouteStops
     * const { count } = await prisma.routeStop.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RouteStopDeleteManyArgs>(args?: SelectSubset<T, RouteStopDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more RouteStops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteStopUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many RouteStops
     * const routeStop = await prisma.routeStop.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RouteStopUpdateManyArgs>(args: SelectSubset<T, RouteStopUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one RouteStop.
     * @param {RouteStopUpsertArgs} args - Arguments to update or create a RouteStop.
     * @example
     * // Update or create a RouteStop
     * const routeStop = await prisma.routeStop.upsert({
     *   create: {
     *     // ... data to create a RouteStop
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the RouteStop we want to update
     *   }
     * })
     */
    upsert<T extends RouteStopUpsertArgs>(args: SelectSubset<T, RouteStopUpsertArgs<ExtArgs>>): Prisma__RouteStopClient<$Result.GetResult<Prisma.$RouteStopPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of RouteStops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteStopCountArgs} args - Arguments to filter RouteStops to count.
     * @example
     * // Count the number of RouteStops
     * const count = await prisma.routeStop.count({
     *   where: {
     *     // ... the filter for the RouteStops we want to count
     *   }
     * })
    **/
    count<T extends RouteStopCountArgs>(
      args?: Subset<T, RouteStopCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RouteStopCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a RouteStop.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteStopAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RouteStopAggregateArgs>(args: Subset<T, RouteStopAggregateArgs>): Prisma.PrismaPromise<GetRouteStopAggregateType<T>>

    /**
     * Group by RouteStop.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RouteStopGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RouteStopGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RouteStopGroupByArgs['orderBy'] }
        : { orderBy?: RouteStopGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RouteStopGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRouteStopGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the RouteStop model
   */
  readonly fields: RouteStopFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for RouteStop.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RouteStopClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    route<T extends RouteDefaultArgs<ExtArgs> = {}>(args?: Subset<T, RouteDefaultArgs<ExtArgs>>): Prisma__RouteClient<$Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the RouteStop model
   */ 
  interface RouteStopFieldRefs {
    readonly id: FieldRef<"RouteStop", 'String'>
    readonly routeId: FieldRef<"RouteStop", 'String'>
    readonly name: FieldRef<"RouteStop", 'String'>
    readonly lat: FieldRef<"RouteStop", 'Float'>
    readonly lng: FieldRef<"RouteStop", 'Float'>
    readonly order: FieldRef<"RouteStop", 'Int'>
    readonly distanceFromStart: FieldRef<"RouteStop", 'Float'>
    readonly estimatedTime: FieldRef<"RouteStop", 'Int'>
    readonly createdAt: FieldRef<"RouteStop", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * RouteStop findUnique
   */
  export type RouteStopFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * Filter, which RouteStop to fetch.
     */
    where: RouteStopWhereUniqueInput
  }

  /**
   * RouteStop findUniqueOrThrow
   */
  export type RouteStopFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * Filter, which RouteStop to fetch.
     */
    where: RouteStopWhereUniqueInput
  }

  /**
   * RouteStop findFirst
   */
  export type RouteStopFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * Filter, which RouteStop to fetch.
     */
    where?: RouteStopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RouteStops to fetch.
     */
    orderBy?: RouteStopOrderByWithRelationInput | RouteStopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RouteStops.
     */
    cursor?: RouteStopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RouteStops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RouteStops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RouteStops.
     */
    distinct?: RouteStopScalarFieldEnum | RouteStopScalarFieldEnum[]
  }

  /**
   * RouteStop findFirstOrThrow
   */
  export type RouteStopFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * Filter, which RouteStop to fetch.
     */
    where?: RouteStopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RouteStops to fetch.
     */
    orderBy?: RouteStopOrderByWithRelationInput | RouteStopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for RouteStops.
     */
    cursor?: RouteStopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RouteStops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RouteStops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of RouteStops.
     */
    distinct?: RouteStopScalarFieldEnum | RouteStopScalarFieldEnum[]
  }

  /**
   * RouteStop findMany
   */
  export type RouteStopFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * Filter, which RouteStops to fetch.
     */
    where?: RouteStopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of RouteStops to fetch.
     */
    orderBy?: RouteStopOrderByWithRelationInput | RouteStopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing RouteStops.
     */
    cursor?: RouteStopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` RouteStops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` RouteStops.
     */
    skip?: number
    distinct?: RouteStopScalarFieldEnum | RouteStopScalarFieldEnum[]
  }

  /**
   * RouteStop create
   */
  export type RouteStopCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * The data needed to create a RouteStop.
     */
    data: XOR<RouteStopCreateInput, RouteStopUncheckedCreateInput>
  }

  /**
   * RouteStop createMany
   */
  export type RouteStopCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many RouteStops.
     */
    data: RouteStopCreateManyInput | RouteStopCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * RouteStop createManyAndReturn
   */
  export type RouteStopCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many RouteStops.
     */
    data: RouteStopCreateManyInput | RouteStopCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * RouteStop update
   */
  export type RouteStopUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * The data needed to update a RouteStop.
     */
    data: XOR<RouteStopUpdateInput, RouteStopUncheckedUpdateInput>
    /**
     * Choose, which RouteStop to update.
     */
    where: RouteStopWhereUniqueInput
  }

  /**
   * RouteStop updateMany
   */
  export type RouteStopUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update RouteStops.
     */
    data: XOR<RouteStopUpdateManyMutationInput, RouteStopUncheckedUpdateManyInput>
    /**
     * Filter which RouteStops to update
     */
    where?: RouteStopWhereInput
  }

  /**
   * RouteStop upsert
   */
  export type RouteStopUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * The filter to search for the RouteStop to update in case it exists.
     */
    where: RouteStopWhereUniqueInput
    /**
     * In case the RouteStop found by the `where` argument doesn't exist, create a new RouteStop with this data.
     */
    create: XOR<RouteStopCreateInput, RouteStopUncheckedCreateInput>
    /**
     * In case the RouteStop was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RouteStopUpdateInput, RouteStopUncheckedUpdateInput>
  }

  /**
   * RouteStop delete
   */
  export type RouteStopDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
    /**
     * Filter which RouteStop to delete.
     */
    where: RouteStopWhereUniqueInput
  }

  /**
   * RouteStop deleteMany
   */
  export type RouteStopDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which RouteStops to delete
     */
    where?: RouteStopWhereInput
  }

  /**
   * RouteStop without action
   */
  export type RouteStopDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the RouteStop
     */
    select?: RouteStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RouteStopInclude<ExtArgs> | null
  }


  /**
   * Model Trip
   */

  export type AggregateTrip = {
    _count: TripCountAggregateOutputType | null
    _avg: TripAvgAggregateOutputType | null
    _sum: TripSumAggregateOutputType | null
    _min: TripMinAggregateOutputType | null
    _max: TripMaxAggregateOutputType | null
  }

  export type TripAvgAggregateOutputType = {
    lastLat: number | null
    lastLng: number | null
    lastSpeed: number | null
    lastHeading: number | null
    destLat: number | null
    destLng: number | null
  }

  export type TripSumAggregateOutputType = {
    lastLat: number | null
    lastLng: number | null
    lastSpeed: number | null
    lastHeading: number | null
    destLat: number | null
    destLng: number | null
  }

  export type TripMinAggregateOutputType = {
    id: string | null
    busId: string | null
    driverId: string | null
    direction: $Enums.TripDirection | null
    status: $Enums.TripStatus | null
    startedAt: Date | null
    endedAt: Date | null
    lastLat: number | null
    lastLng: number | null
    lastSpeed: number | null
    lastHeading: number | null
    lastLocationAt: Date | null
    destName: string | null
    destLat: number | null
    destLng: number | null
  }

  export type TripMaxAggregateOutputType = {
    id: string | null
    busId: string | null
    driverId: string | null
    direction: $Enums.TripDirection | null
    status: $Enums.TripStatus | null
    startedAt: Date | null
    endedAt: Date | null
    lastLat: number | null
    lastLng: number | null
    lastSpeed: number | null
    lastHeading: number | null
    lastLocationAt: Date | null
    destName: string | null
    destLat: number | null
    destLng: number | null
  }

  export type TripCountAggregateOutputType = {
    id: number
    busId: number
    driverId: number
    direction: number
    status: number
    startedAt: number
    endedAt: number
    lastLat: number
    lastLng: number
    lastSpeed: number
    lastHeading: number
    lastLocationAt: number
    destName: number
    destLat: number
    destLng: number
    _all: number
  }


  export type TripAvgAggregateInputType = {
    lastLat?: true
    lastLng?: true
    lastSpeed?: true
    lastHeading?: true
    destLat?: true
    destLng?: true
  }

  export type TripSumAggregateInputType = {
    lastLat?: true
    lastLng?: true
    lastSpeed?: true
    lastHeading?: true
    destLat?: true
    destLng?: true
  }

  export type TripMinAggregateInputType = {
    id?: true
    busId?: true
    driverId?: true
    direction?: true
    status?: true
    startedAt?: true
    endedAt?: true
    lastLat?: true
    lastLng?: true
    lastSpeed?: true
    lastHeading?: true
    lastLocationAt?: true
    destName?: true
    destLat?: true
    destLng?: true
  }

  export type TripMaxAggregateInputType = {
    id?: true
    busId?: true
    driverId?: true
    direction?: true
    status?: true
    startedAt?: true
    endedAt?: true
    lastLat?: true
    lastLng?: true
    lastSpeed?: true
    lastHeading?: true
    lastLocationAt?: true
    destName?: true
    destLat?: true
    destLng?: true
  }

  export type TripCountAggregateInputType = {
    id?: true
    busId?: true
    driverId?: true
    direction?: true
    status?: true
    startedAt?: true
    endedAt?: true
    lastLat?: true
    lastLng?: true
    lastSpeed?: true
    lastHeading?: true
    lastLocationAt?: true
    destName?: true
    destLat?: true
    destLng?: true
    _all?: true
  }

  export type TripAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trip to aggregate.
     */
    where?: TripWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trips to fetch.
     */
    orderBy?: TripOrderByWithRelationInput | TripOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TripWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trips from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trips.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Trips
    **/
    _count?: true | TripCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TripAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TripSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TripMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TripMaxAggregateInputType
  }

  export type GetTripAggregateType<T extends TripAggregateArgs> = {
        [P in keyof T & keyof AggregateTrip]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrip[P]>
      : GetScalarType<T[P], AggregateTrip[P]>
  }




  export type TripGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TripWhereInput
    orderBy?: TripOrderByWithAggregationInput | TripOrderByWithAggregationInput[]
    by: TripScalarFieldEnum[] | TripScalarFieldEnum
    having?: TripScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TripCountAggregateInputType | true
    _avg?: TripAvgAggregateInputType
    _sum?: TripSumAggregateInputType
    _min?: TripMinAggregateInputType
    _max?: TripMaxAggregateInputType
  }

  export type TripGroupByOutputType = {
    id: string
    busId: string
    driverId: string
    direction: $Enums.TripDirection
    status: $Enums.TripStatus
    startedAt: Date
    endedAt: Date | null
    lastLat: number | null
    lastLng: number | null
    lastSpeed: number | null
    lastHeading: number | null
    lastLocationAt: Date | null
    destName: string | null
    destLat: number | null
    destLng: number | null
    _count: TripCountAggregateOutputType | null
    _avg: TripAvgAggregateOutputType | null
    _sum: TripSumAggregateOutputType | null
    _min: TripMinAggregateOutputType | null
    _max: TripMaxAggregateOutputType | null
  }

  type GetTripGroupByPayload<T extends TripGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TripGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TripGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TripGroupByOutputType[P]>
            : GetScalarType<T[P], TripGroupByOutputType[P]>
        }
      >
    >


  export type TripSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busId?: boolean
    driverId?: boolean
    direction?: boolean
    status?: boolean
    startedAt?: boolean
    endedAt?: boolean
    lastLat?: boolean
    lastLng?: boolean
    lastSpeed?: boolean
    lastHeading?: boolean
    lastLocationAt?: boolean
    destName?: boolean
    destLat?: boolean
    destLng?: boolean
    stops?: boolean | Trip$stopsArgs<ExtArgs>
    _count?: boolean | TripCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["trip"]>

  export type TripSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    busId?: boolean
    driverId?: boolean
    direction?: boolean
    status?: boolean
    startedAt?: boolean
    endedAt?: boolean
    lastLat?: boolean
    lastLng?: boolean
    lastSpeed?: boolean
    lastHeading?: boolean
    lastLocationAt?: boolean
    destName?: boolean
    destLat?: boolean
    destLng?: boolean
  }, ExtArgs["result"]["trip"]>

  export type TripSelectScalar = {
    id?: boolean
    busId?: boolean
    driverId?: boolean
    direction?: boolean
    status?: boolean
    startedAt?: boolean
    endedAt?: boolean
    lastLat?: boolean
    lastLng?: boolean
    lastSpeed?: boolean
    lastHeading?: boolean
    lastLocationAt?: boolean
    destName?: boolean
    destLat?: boolean
    destLng?: boolean
  }

  export type TripInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    stops?: boolean | Trip$stopsArgs<ExtArgs>
    _count?: boolean | TripCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TripIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TripPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Trip"
    objects: {
      stops: Prisma.$TripStopPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      busId: string
      driverId: string
      direction: $Enums.TripDirection
      status: $Enums.TripStatus
      startedAt: Date
      endedAt: Date | null
      lastLat: number | null
      lastLng: number | null
      lastSpeed: number | null
      lastHeading: number | null
      lastLocationAt: Date | null
      destName: string | null
      destLat: number | null
      destLng: number | null
    }, ExtArgs["result"]["trip"]>
    composites: {}
  }

  type TripGetPayload<S extends boolean | null | undefined | TripDefaultArgs> = $Result.GetResult<Prisma.$TripPayload, S>

  type TripCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TripFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TripCountAggregateInputType | true
    }

  export interface TripDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Trip'], meta: { name: 'Trip' } }
    /**
     * Find zero or one Trip that matches the filter.
     * @param {TripFindUniqueArgs} args - Arguments to find a Trip
     * @example
     * // Get one Trip
     * const trip = await prisma.trip.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TripFindUniqueArgs>(args: SelectSubset<T, TripFindUniqueArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Trip that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TripFindUniqueOrThrowArgs} args - Arguments to find a Trip
     * @example
     * // Get one Trip
     * const trip = await prisma.trip.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TripFindUniqueOrThrowArgs>(args: SelectSubset<T, TripFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Trip that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripFindFirstArgs} args - Arguments to find a Trip
     * @example
     * // Get one Trip
     * const trip = await prisma.trip.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TripFindFirstArgs>(args?: SelectSubset<T, TripFindFirstArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Trip that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripFindFirstOrThrowArgs} args - Arguments to find a Trip
     * @example
     * // Get one Trip
     * const trip = await prisma.trip.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TripFindFirstOrThrowArgs>(args?: SelectSubset<T, TripFindFirstOrThrowArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Trips that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Trips
     * const trips = await prisma.trip.findMany()
     * 
     * // Get first 10 Trips
     * const trips = await prisma.trip.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tripWithIdOnly = await prisma.trip.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TripFindManyArgs>(args?: SelectSubset<T, TripFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Trip.
     * @param {TripCreateArgs} args - Arguments to create a Trip.
     * @example
     * // Create one Trip
     * const Trip = await prisma.trip.create({
     *   data: {
     *     // ... data to create a Trip
     *   }
     * })
     * 
     */
    create<T extends TripCreateArgs>(args: SelectSubset<T, TripCreateArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Trips.
     * @param {TripCreateManyArgs} args - Arguments to create many Trips.
     * @example
     * // Create many Trips
     * const trip = await prisma.trip.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TripCreateManyArgs>(args?: SelectSubset<T, TripCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Trips and returns the data saved in the database.
     * @param {TripCreateManyAndReturnArgs} args - Arguments to create many Trips.
     * @example
     * // Create many Trips
     * const trip = await prisma.trip.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Trips and only return the `id`
     * const tripWithIdOnly = await prisma.trip.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TripCreateManyAndReturnArgs>(args?: SelectSubset<T, TripCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Trip.
     * @param {TripDeleteArgs} args - Arguments to delete one Trip.
     * @example
     * // Delete one Trip
     * const Trip = await prisma.trip.delete({
     *   where: {
     *     // ... filter to delete one Trip
     *   }
     * })
     * 
     */
    delete<T extends TripDeleteArgs>(args: SelectSubset<T, TripDeleteArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Trip.
     * @param {TripUpdateArgs} args - Arguments to update one Trip.
     * @example
     * // Update one Trip
     * const trip = await prisma.trip.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TripUpdateArgs>(args: SelectSubset<T, TripUpdateArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Trips.
     * @param {TripDeleteManyArgs} args - Arguments to filter Trips to delete.
     * @example
     * // Delete a few Trips
     * const { count } = await prisma.trip.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TripDeleteManyArgs>(args?: SelectSubset<T, TripDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Trips.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Trips
     * const trip = await prisma.trip.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TripUpdateManyArgs>(args: SelectSubset<T, TripUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Trip.
     * @param {TripUpsertArgs} args - Arguments to update or create a Trip.
     * @example
     * // Update or create a Trip
     * const trip = await prisma.trip.upsert({
     *   create: {
     *     // ... data to create a Trip
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Trip we want to update
     *   }
     * })
     */
    upsert<T extends TripUpsertArgs>(args: SelectSubset<T, TripUpsertArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Trips.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripCountArgs} args - Arguments to filter Trips to count.
     * @example
     * // Count the number of Trips
     * const count = await prisma.trip.count({
     *   where: {
     *     // ... the filter for the Trips we want to count
     *   }
     * })
    **/
    count<T extends TripCountArgs>(
      args?: Subset<T, TripCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TripCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Trip.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TripAggregateArgs>(args: Subset<T, TripAggregateArgs>): Prisma.PrismaPromise<GetTripAggregateType<T>>

    /**
     * Group by Trip.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TripGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TripGroupByArgs['orderBy'] }
        : { orderBy?: TripGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TripGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTripGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Trip model
   */
  readonly fields: TripFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Trip.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TripClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    stops<T extends Trip$stopsArgs<ExtArgs> = {}>(args?: Subset<T, Trip$stopsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Trip model
   */ 
  interface TripFieldRefs {
    readonly id: FieldRef<"Trip", 'String'>
    readonly busId: FieldRef<"Trip", 'String'>
    readonly driverId: FieldRef<"Trip", 'String'>
    readonly direction: FieldRef<"Trip", 'TripDirection'>
    readonly status: FieldRef<"Trip", 'TripStatus'>
    readonly startedAt: FieldRef<"Trip", 'DateTime'>
    readonly endedAt: FieldRef<"Trip", 'DateTime'>
    readonly lastLat: FieldRef<"Trip", 'Float'>
    readonly lastLng: FieldRef<"Trip", 'Float'>
    readonly lastSpeed: FieldRef<"Trip", 'Float'>
    readonly lastHeading: FieldRef<"Trip", 'Float'>
    readonly lastLocationAt: FieldRef<"Trip", 'DateTime'>
    readonly destName: FieldRef<"Trip", 'String'>
    readonly destLat: FieldRef<"Trip", 'Float'>
    readonly destLng: FieldRef<"Trip", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * Trip findUnique
   */
  export type TripFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * Filter, which Trip to fetch.
     */
    where: TripWhereUniqueInput
  }

  /**
   * Trip findUniqueOrThrow
   */
  export type TripFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * Filter, which Trip to fetch.
     */
    where: TripWhereUniqueInput
  }

  /**
   * Trip findFirst
   */
  export type TripFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * Filter, which Trip to fetch.
     */
    where?: TripWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trips to fetch.
     */
    orderBy?: TripOrderByWithRelationInput | TripOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trips.
     */
    cursor?: TripWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trips from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trips.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trips.
     */
    distinct?: TripScalarFieldEnum | TripScalarFieldEnum[]
  }

  /**
   * Trip findFirstOrThrow
   */
  export type TripFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * Filter, which Trip to fetch.
     */
    where?: TripWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trips to fetch.
     */
    orderBy?: TripOrderByWithRelationInput | TripOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Trips.
     */
    cursor?: TripWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trips from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trips.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Trips.
     */
    distinct?: TripScalarFieldEnum | TripScalarFieldEnum[]
  }

  /**
   * Trip findMany
   */
  export type TripFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * Filter, which Trips to fetch.
     */
    where?: TripWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Trips to fetch.
     */
    orderBy?: TripOrderByWithRelationInput | TripOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Trips.
     */
    cursor?: TripWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Trips from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Trips.
     */
    skip?: number
    distinct?: TripScalarFieldEnum | TripScalarFieldEnum[]
  }

  /**
   * Trip create
   */
  export type TripCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * The data needed to create a Trip.
     */
    data: XOR<TripCreateInput, TripUncheckedCreateInput>
  }

  /**
   * Trip createMany
   */
  export type TripCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Trips.
     */
    data: TripCreateManyInput | TripCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trip createManyAndReturn
   */
  export type TripCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Trips.
     */
    data: TripCreateManyInput | TripCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Trip update
   */
  export type TripUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * The data needed to update a Trip.
     */
    data: XOR<TripUpdateInput, TripUncheckedUpdateInput>
    /**
     * Choose, which Trip to update.
     */
    where: TripWhereUniqueInput
  }

  /**
   * Trip updateMany
   */
  export type TripUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Trips.
     */
    data: XOR<TripUpdateManyMutationInput, TripUncheckedUpdateManyInput>
    /**
     * Filter which Trips to update
     */
    where?: TripWhereInput
  }

  /**
   * Trip upsert
   */
  export type TripUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * The filter to search for the Trip to update in case it exists.
     */
    where: TripWhereUniqueInput
    /**
     * In case the Trip found by the `where` argument doesn't exist, create a new Trip with this data.
     */
    create: XOR<TripCreateInput, TripUncheckedCreateInput>
    /**
     * In case the Trip was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TripUpdateInput, TripUncheckedUpdateInput>
  }

  /**
   * Trip delete
   */
  export type TripDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
    /**
     * Filter which Trip to delete.
     */
    where: TripWhereUniqueInput
  }

  /**
   * Trip deleteMany
   */
  export type TripDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Trips to delete
     */
    where?: TripWhereInput
  }

  /**
   * Trip.stops
   */
  export type Trip$stopsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    where?: TripStopWhereInput
    orderBy?: TripStopOrderByWithRelationInput | TripStopOrderByWithRelationInput[]
    cursor?: TripStopWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TripStopScalarFieldEnum | TripStopScalarFieldEnum[]
  }

  /**
   * Trip without action
   */
  export type TripDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Trip
     */
    select?: TripSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripInclude<ExtArgs> | null
  }


  /**
   * Model TripStop
   */

  export type AggregateTripStop = {
    _count: TripStopCountAggregateOutputType | null
    _avg: TripStopAvgAggregateOutputType | null
    _sum: TripStopSumAggregateOutputType | null
    _min: TripStopMinAggregateOutputType | null
    _max: TripStopMaxAggregateOutputType | null
  }

  export type TripStopAvgAggregateOutputType = {
    order: number | null
    lat: number | null
    lng: number | null
  }

  export type TripStopSumAggregateOutputType = {
    order: number | null
    lat: number | null
    lng: number | null
  }

  export type TripStopMinAggregateOutputType = {
    id: string | null
    tripId: string | null
    stopId: string | null
    order: number | null
    name: string | null
    lat: number | null
    lng: number | null
    status: $Enums.TripStopStatus | null
    arrivedAt: Date | null
    completedAt: Date | null
  }

  export type TripStopMaxAggregateOutputType = {
    id: string | null
    tripId: string | null
    stopId: string | null
    order: number | null
    name: string | null
    lat: number | null
    lng: number | null
    status: $Enums.TripStopStatus | null
    arrivedAt: Date | null
    completedAt: Date | null
  }

  export type TripStopCountAggregateOutputType = {
    id: number
    tripId: number
    stopId: number
    order: number
    name: number
    lat: number
    lng: number
    status: number
    arrivedAt: number
    completedAt: number
    _all: number
  }


  export type TripStopAvgAggregateInputType = {
    order?: true
    lat?: true
    lng?: true
  }

  export type TripStopSumAggregateInputType = {
    order?: true
    lat?: true
    lng?: true
  }

  export type TripStopMinAggregateInputType = {
    id?: true
    tripId?: true
    stopId?: true
    order?: true
    name?: true
    lat?: true
    lng?: true
    status?: true
    arrivedAt?: true
    completedAt?: true
  }

  export type TripStopMaxAggregateInputType = {
    id?: true
    tripId?: true
    stopId?: true
    order?: true
    name?: true
    lat?: true
    lng?: true
    status?: true
    arrivedAt?: true
    completedAt?: true
  }

  export type TripStopCountAggregateInputType = {
    id?: true
    tripId?: true
    stopId?: true
    order?: true
    name?: true
    lat?: true
    lng?: true
    status?: true
    arrivedAt?: true
    completedAt?: true
    _all?: true
  }

  export type TripStopAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TripStop to aggregate.
     */
    where?: TripStopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TripStops to fetch.
     */
    orderBy?: TripStopOrderByWithRelationInput | TripStopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TripStopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TripStops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TripStops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TripStops
    **/
    _count?: true | TripStopCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TripStopAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TripStopSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TripStopMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TripStopMaxAggregateInputType
  }

  export type GetTripStopAggregateType<T extends TripStopAggregateArgs> = {
        [P in keyof T & keyof AggregateTripStop]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTripStop[P]>
      : GetScalarType<T[P], AggregateTripStop[P]>
  }




  export type TripStopGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TripStopWhereInput
    orderBy?: TripStopOrderByWithAggregationInput | TripStopOrderByWithAggregationInput[]
    by: TripStopScalarFieldEnum[] | TripStopScalarFieldEnum
    having?: TripStopScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TripStopCountAggregateInputType | true
    _avg?: TripStopAvgAggregateInputType
    _sum?: TripStopSumAggregateInputType
    _min?: TripStopMinAggregateInputType
    _max?: TripStopMaxAggregateInputType
  }

  export type TripStopGroupByOutputType = {
    id: string
    tripId: string
    stopId: string
    order: number
    name: string
    lat: number
    lng: number
    status: $Enums.TripStopStatus
    arrivedAt: Date | null
    completedAt: Date | null
    _count: TripStopCountAggregateOutputType | null
    _avg: TripStopAvgAggregateOutputType | null
    _sum: TripStopSumAggregateOutputType | null
    _min: TripStopMinAggregateOutputType | null
    _max: TripStopMaxAggregateOutputType | null
  }

  type GetTripStopGroupByPayload<T extends TripStopGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TripStopGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TripStopGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TripStopGroupByOutputType[P]>
            : GetScalarType<T[P], TripStopGroupByOutputType[P]>
        }
      >
    >


  export type TripStopSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tripId?: boolean
    stopId?: boolean
    order?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    status?: boolean
    arrivedAt?: boolean
    completedAt?: boolean
    trip?: boolean | TripDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tripStop"]>

  export type TripStopSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tripId?: boolean
    stopId?: boolean
    order?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    status?: boolean
    arrivedAt?: boolean
    completedAt?: boolean
    trip?: boolean | TripDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["tripStop"]>

  export type TripStopSelectScalar = {
    id?: boolean
    tripId?: boolean
    stopId?: boolean
    order?: boolean
    name?: boolean
    lat?: boolean
    lng?: boolean
    status?: boolean
    arrivedAt?: boolean
    completedAt?: boolean
  }

  export type TripStopInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trip?: boolean | TripDefaultArgs<ExtArgs>
  }
  export type TripStopIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    trip?: boolean | TripDefaultArgs<ExtArgs>
  }

  export type $TripStopPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TripStop"
    objects: {
      trip: Prisma.$TripPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tripId: string
      stopId: string
      order: number
      name: string
      lat: number
      lng: number
      status: $Enums.TripStopStatus
      arrivedAt: Date | null
      completedAt: Date | null
    }, ExtArgs["result"]["tripStop"]>
    composites: {}
  }

  type TripStopGetPayload<S extends boolean | null | undefined | TripStopDefaultArgs> = $Result.GetResult<Prisma.$TripStopPayload, S>

  type TripStopCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<TripStopFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: TripStopCountAggregateInputType | true
    }

  export interface TripStopDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TripStop'], meta: { name: 'TripStop' } }
    /**
     * Find zero or one TripStop that matches the filter.
     * @param {TripStopFindUniqueArgs} args - Arguments to find a TripStop
     * @example
     * // Get one TripStop
     * const tripStop = await prisma.tripStop.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TripStopFindUniqueArgs>(args: SelectSubset<T, TripStopFindUniqueArgs<ExtArgs>>): Prisma__TripStopClient<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one TripStop that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {TripStopFindUniqueOrThrowArgs} args - Arguments to find a TripStop
     * @example
     * // Get one TripStop
     * const tripStop = await prisma.tripStop.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TripStopFindUniqueOrThrowArgs>(args: SelectSubset<T, TripStopFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TripStopClient<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first TripStop that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripStopFindFirstArgs} args - Arguments to find a TripStop
     * @example
     * // Get one TripStop
     * const tripStop = await prisma.tripStop.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TripStopFindFirstArgs>(args?: SelectSubset<T, TripStopFindFirstArgs<ExtArgs>>): Prisma__TripStopClient<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first TripStop that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripStopFindFirstOrThrowArgs} args - Arguments to find a TripStop
     * @example
     * // Get one TripStop
     * const tripStop = await prisma.tripStop.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TripStopFindFirstOrThrowArgs>(args?: SelectSubset<T, TripStopFindFirstOrThrowArgs<ExtArgs>>): Prisma__TripStopClient<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more TripStops that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripStopFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TripStops
     * const tripStops = await prisma.tripStop.findMany()
     * 
     * // Get first 10 TripStops
     * const tripStops = await prisma.tripStop.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tripStopWithIdOnly = await prisma.tripStop.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TripStopFindManyArgs>(args?: SelectSubset<T, TripStopFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a TripStop.
     * @param {TripStopCreateArgs} args - Arguments to create a TripStop.
     * @example
     * // Create one TripStop
     * const TripStop = await prisma.tripStop.create({
     *   data: {
     *     // ... data to create a TripStop
     *   }
     * })
     * 
     */
    create<T extends TripStopCreateArgs>(args: SelectSubset<T, TripStopCreateArgs<ExtArgs>>): Prisma__TripStopClient<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many TripStops.
     * @param {TripStopCreateManyArgs} args - Arguments to create many TripStops.
     * @example
     * // Create many TripStops
     * const tripStop = await prisma.tripStop.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TripStopCreateManyArgs>(args?: SelectSubset<T, TripStopCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TripStops and returns the data saved in the database.
     * @param {TripStopCreateManyAndReturnArgs} args - Arguments to create many TripStops.
     * @example
     * // Create many TripStops
     * const tripStop = await prisma.tripStop.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TripStops and only return the `id`
     * const tripStopWithIdOnly = await prisma.tripStop.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TripStopCreateManyAndReturnArgs>(args?: SelectSubset<T, TripStopCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a TripStop.
     * @param {TripStopDeleteArgs} args - Arguments to delete one TripStop.
     * @example
     * // Delete one TripStop
     * const TripStop = await prisma.tripStop.delete({
     *   where: {
     *     // ... filter to delete one TripStop
     *   }
     * })
     * 
     */
    delete<T extends TripStopDeleteArgs>(args: SelectSubset<T, TripStopDeleteArgs<ExtArgs>>): Prisma__TripStopClient<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one TripStop.
     * @param {TripStopUpdateArgs} args - Arguments to update one TripStop.
     * @example
     * // Update one TripStop
     * const tripStop = await prisma.tripStop.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TripStopUpdateArgs>(args: SelectSubset<T, TripStopUpdateArgs<ExtArgs>>): Prisma__TripStopClient<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more TripStops.
     * @param {TripStopDeleteManyArgs} args - Arguments to filter TripStops to delete.
     * @example
     * // Delete a few TripStops
     * const { count } = await prisma.tripStop.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TripStopDeleteManyArgs>(args?: SelectSubset<T, TripStopDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TripStops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripStopUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TripStops
     * const tripStop = await prisma.tripStop.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TripStopUpdateManyArgs>(args: SelectSubset<T, TripStopUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one TripStop.
     * @param {TripStopUpsertArgs} args - Arguments to update or create a TripStop.
     * @example
     * // Update or create a TripStop
     * const tripStop = await prisma.tripStop.upsert({
     *   create: {
     *     // ... data to create a TripStop
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TripStop we want to update
     *   }
     * })
     */
    upsert<T extends TripStopUpsertArgs>(args: SelectSubset<T, TripStopUpsertArgs<ExtArgs>>): Prisma__TripStopClient<$Result.GetResult<Prisma.$TripStopPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of TripStops.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripStopCountArgs} args - Arguments to filter TripStops to count.
     * @example
     * // Count the number of TripStops
     * const count = await prisma.tripStop.count({
     *   where: {
     *     // ... the filter for the TripStops we want to count
     *   }
     * })
    **/
    count<T extends TripStopCountArgs>(
      args?: Subset<T, TripStopCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TripStopCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TripStop.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripStopAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TripStopAggregateArgs>(args: Subset<T, TripStopAggregateArgs>): Prisma.PrismaPromise<GetTripStopAggregateType<T>>

    /**
     * Group by TripStop.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TripStopGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TripStopGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TripStopGroupByArgs['orderBy'] }
        : { orderBy?: TripStopGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TripStopGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTripStopGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TripStop model
   */
  readonly fields: TripStopFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TripStop.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TripStopClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    trip<T extends TripDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TripDefaultArgs<ExtArgs>>): Prisma__TripClient<$Result.GetResult<Prisma.$TripPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the TripStop model
   */ 
  interface TripStopFieldRefs {
    readonly id: FieldRef<"TripStop", 'String'>
    readonly tripId: FieldRef<"TripStop", 'String'>
    readonly stopId: FieldRef<"TripStop", 'String'>
    readonly order: FieldRef<"TripStop", 'Int'>
    readonly name: FieldRef<"TripStop", 'String'>
    readonly lat: FieldRef<"TripStop", 'Float'>
    readonly lng: FieldRef<"TripStop", 'Float'>
    readonly status: FieldRef<"TripStop", 'TripStopStatus'>
    readonly arrivedAt: FieldRef<"TripStop", 'DateTime'>
    readonly completedAt: FieldRef<"TripStop", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * TripStop findUnique
   */
  export type TripStopFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * Filter, which TripStop to fetch.
     */
    where: TripStopWhereUniqueInput
  }

  /**
   * TripStop findUniqueOrThrow
   */
  export type TripStopFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * Filter, which TripStop to fetch.
     */
    where: TripStopWhereUniqueInput
  }

  /**
   * TripStop findFirst
   */
  export type TripStopFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * Filter, which TripStop to fetch.
     */
    where?: TripStopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TripStops to fetch.
     */
    orderBy?: TripStopOrderByWithRelationInput | TripStopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TripStops.
     */
    cursor?: TripStopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TripStops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TripStops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TripStops.
     */
    distinct?: TripStopScalarFieldEnum | TripStopScalarFieldEnum[]
  }

  /**
   * TripStop findFirstOrThrow
   */
  export type TripStopFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * Filter, which TripStop to fetch.
     */
    where?: TripStopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TripStops to fetch.
     */
    orderBy?: TripStopOrderByWithRelationInput | TripStopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TripStops.
     */
    cursor?: TripStopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TripStops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TripStops.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TripStops.
     */
    distinct?: TripStopScalarFieldEnum | TripStopScalarFieldEnum[]
  }

  /**
   * TripStop findMany
   */
  export type TripStopFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * Filter, which TripStops to fetch.
     */
    where?: TripStopWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TripStops to fetch.
     */
    orderBy?: TripStopOrderByWithRelationInput | TripStopOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TripStops.
     */
    cursor?: TripStopWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TripStops from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TripStops.
     */
    skip?: number
    distinct?: TripStopScalarFieldEnum | TripStopScalarFieldEnum[]
  }

  /**
   * TripStop create
   */
  export type TripStopCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * The data needed to create a TripStop.
     */
    data: XOR<TripStopCreateInput, TripStopUncheckedCreateInput>
  }

  /**
   * TripStop createMany
   */
  export type TripStopCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TripStops.
     */
    data: TripStopCreateManyInput | TripStopCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TripStop createManyAndReturn
   */
  export type TripStopCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many TripStops.
     */
    data: TripStopCreateManyInput | TripStopCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TripStop update
   */
  export type TripStopUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * The data needed to update a TripStop.
     */
    data: XOR<TripStopUpdateInput, TripStopUncheckedUpdateInput>
    /**
     * Choose, which TripStop to update.
     */
    where: TripStopWhereUniqueInput
  }

  /**
   * TripStop updateMany
   */
  export type TripStopUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TripStops.
     */
    data: XOR<TripStopUpdateManyMutationInput, TripStopUncheckedUpdateManyInput>
    /**
     * Filter which TripStops to update
     */
    where?: TripStopWhereInput
  }

  /**
   * TripStop upsert
   */
  export type TripStopUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * The filter to search for the TripStop to update in case it exists.
     */
    where: TripStopWhereUniqueInput
    /**
     * In case the TripStop found by the `where` argument doesn't exist, create a new TripStop with this data.
     */
    create: XOR<TripStopCreateInput, TripStopUncheckedCreateInput>
    /**
     * In case the TripStop was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TripStopUpdateInput, TripStopUncheckedUpdateInput>
  }

  /**
   * TripStop delete
   */
  export type TripStopDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
    /**
     * Filter which TripStop to delete.
     */
    where: TripStopWhereUniqueInput
  }

  /**
   * TripStop deleteMany
   */
  export type TripStopDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TripStops to delete
     */
    where?: TripStopWhereInput
  }

  /**
   * TripStop without action
   */
  export type TripStopDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TripStop
     */
    select?: TripStopSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TripStopInclude<ExtArgs> | null
  }


  /**
   * Model NotificationLog
   */

  export type AggregateNotificationLog = {
    _count: NotificationLogCountAggregateOutputType | null
    _avg: NotificationLogAvgAggregateOutputType | null
    _sum: NotificationLogSumAggregateOutputType | null
    _min: NotificationLogMinAggregateOutputType | null
    _max: NotificationLogMaxAggregateOutputType | null
  }

  export type NotificationLogAvgAggregateOutputType = {
    etaSeconds: number | null
  }

  export type NotificationLogSumAggregateOutputType = {
    etaSeconds: number | null
  }

  export type NotificationLogMinAggregateOutputType = {
    id: string | null
    tripId: string | null
    tripStopId: string | null
    studentId: string | null
    type: string | null
    status: string | null
    etaSeconds: number | null
    sentAt: Date | null
    createdAt: Date | null
  }

  export type NotificationLogMaxAggregateOutputType = {
    id: string | null
    tripId: string | null
    tripStopId: string | null
    studentId: string | null
    type: string | null
    status: string | null
    etaSeconds: number | null
    sentAt: Date | null
    createdAt: Date | null
  }

  export type NotificationLogCountAggregateOutputType = {
    id: number
    tripId: number
    tripStopId: number
    studentId: number
    type: number
    status: number
    etaSeconds: number
    sentAt: number
    createdAt: number
    _all: number
  }


  export type NotificationLogAvgAggregateInputType = {
    etaSeconds?: true
  }

  export type NotificationLogSumAggregateInputType = {
    etaSeconds?: true
  }

  export type NotificationLogMinAggregateInputType = {
    id?: true
    tripId?: true
    tripStopId?: true
    studentId?: true
    type?: true
    status?: true
    etaSeconds?: true
    sentAt?: true
    createdAt?: true
  }

  export type NotificationLogMaxAggregateInputType = {
    id?: true
    tripId?: true
    tripStopId?: true
    studentId?: true
    type?: true
    status?: true
    etaSeconds?: true
    sentAt?: true
    createdAt?: true
  }

  export type NotificationLogCountAggregateInputType = {
    id?: true
    tripId?: true
    tripStopId?: true
    studentId?: true
    type?: true
    status?: true
    etaSeconds?: true
    sentAt?: true
    createdAt?: true
    _all?: true
  }

  export type NotificationLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NotificationLog to aggregate.
     */
    where?: NotificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NotificationLogs to fetch.
     */
    orderBy?: NotificationLogOrderByWithRelationInput | NotificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NotificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NotificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned NotificationLogs
    **/
    _count?: true | NotificationLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NotificationLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NotificationLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationLogMaxAggregateInputType
  }

  export type GetNotificationLogAggregateType<T extends NotificationLogAggregateArgs> = {
        [P in keyof T & keyof AggregateNotificationLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotificationLog[P]>
      : GetScalarType<T[P], AggregateNotificationLog[P]>
  }




  export type NotificationLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationLogWhereInput
    orderBy?: NotificationLogOrderByWithAggregationInput | NotificationLogOrderByWithAggregationInput[]
    by: NotificationLogScalarFieldEnum[] | NotificationLogScalarFieldEnum
    having?: NotificationLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationLogCountAggregateInputType | true
    _avg?: NotificationLogAvgAggregateInputType
    _sum?: NotificationLogSumAggregateInputType
    _min?: NotificationLogMinAggregateInputType
    _max?: NotificationLogMaxAggregateInputType
  }

  export type NotificationLogGroupByOutputType = {
    id: string
    tripId: string
    tripStopId: string
    studentId: string
    type: string
    status: string
    etaSeconds: number | null
    sentAt: Date | null
    createdAt: Date
    _count: NotificationLogCountAggregateOutputType | null
    _avg: NotificationLogAvgAggregateOutputType | null
    _sum: NotificationLogSumAggregateOutputType | null
    _min: NotificationLogMinAggregateOutputType | null
    _max: NotificationLogMaxAggregateOutputType | null
  }

  type GetNotificationLogGroupByPayload<T extends NotificationLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationLogGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationLogGroupByOutputType[P]>
        }
      >
    >


  export type NotificationLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tripId?: boolean
    tripStopId?: boolean
    studentId?: boolean
    type?: boolean
    status?: boolean
    etaSeconds?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["notificationLog"]>

  export type NotificationLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tripId?: boolean
    tripStopId?: boolean
    studentId?: boolean
    type?: boolean
    status?: boolean
    etaSeconds?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["notificationLog"]>

  export type NotificationLogSelectScalar = {
    id?: boolean
    tripId?: boolean
    tripStopId?: boolean
    studentId?: boolean
    type?: boolean
    status?: boolean
    etaSeconds?: boolean
    sentAt?: boolean
    createdAt?: boolean
  }


  export type $NotificationLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "NotificationLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      tripId: string
      tripStopId: string
      studentId: string
      type: string
      status: string
      etaSeconds: number | null
      sentAt: Date | null
      createdAt: Date
    }, ExtArgs["result"]["notificationLog"]>
    composites: {}
  }

  type NotificationLogGetPayload<S extends boolean | null | undefined | NotificationLogDefaultArgs> = $Result.GetResult<Prisma.$NotificationLogPayload, S>

  type NotificationLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<NotificationLogFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: NotificationLogCountAggregateInputType | true
    }

  export interface NotificationLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['NotificationLog'], meta: { name: 'NotificationLog' } }
    /**
     * Find zero or one NotificationLog that matches the filter.
     * @param {NotificationLogFindUniqueArgs} args - Arguments to find a NotificationLog
     * @example
     * // Get one NotificationLog
     * const notificationLog = await prisma.notificationLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationLogFindUniqueArgs>(args: SelectSubset<T, NotificationLogFindUniqueArgs<ExtArgs>>): Prisma__NotificationLogClient<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one NotificationLog that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {NotificationLogFindUniqueOrThrowArgs} args - Arguments to find a NotificationLog
     * @example
     * // Get one NotificationLog
     * const notificationLog = await prisma.notificationLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationLogFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationLogClient<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first NotificationLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationLogFindFirstArgs} args - Arguments to find a NotificationLog
     * @example
     * // Get one NotificationLog
     * const notificationLog = await prisma.notificationLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationLogFindFirstArgs>(args?: SelectSubset<T, NotificationLogFindFirstArgs<ExtArgs>>): Prisma__NotificationLogClient<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first NotificationLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationLogFindFirstOrThrowArgs} args - Arguments to find a NotificationLog
     * @example
     * // Get one NotificationLog
     * const notificationLog = await prisma.notificationLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationLogFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationLogClient<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more NotificationLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all NotificationLogs
     * const notificationLogs = await prisma.notificationLog.findMany()
     * 
     * // Get first 10 NotificationLogs
     * const notificationLogs = await prisma.notificationLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationLogWithIdOnly = await prisma.notificationLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationLogFindManyArgs>(args?: SelectSubset<T, NotificationLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a NotificationLog.
     * @param {NotificationLogCreateArgs} args - Arguments to create a NotificationLog.
     * @example
     * // Create one NotificationLog
     * const NotificationLog = await prisma.notificationLog.create({
     *   data: {
     *     // ... data to create a NotificationLog
     *   }
     * })
     * 
     */
    create<T extends NotificationLogCreateArgs>(args: SelectSubset<T, NotificationLogCreateArgs<ExtArgs>>): Prisma__NotificationLogClient<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many NotificationLogs.
     * @param {NotificationLogCreateManyArgs} args - Arguments to create many NotificationLogs.
     * @example
     * // Create many NotificationLogs
     * const notificationLog = await prisma.notificationLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationLogCreateManyArgs>(args?: SelectSubset<T, NotificationLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many NotificationLogs and returns the data saved in the database.
     * @param {NotificationLogCreateManyAndReturnArgs} args - Arguments to create many NotificationLogs.
     * @example
     * // Create many NotificationLogs
     * const notificationLog = await prisma.notificationLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many NotificationLogs and only return the `id`
     * const notificationLogWithIdOnly = await prisma.notificationLog.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationLogCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a NotificationLog.
     * @param {NotificationLogDeleteArgs} args - Arguments to delete one NotificationLog.
     * @example
     * // Delete one NotificationLog
     * const NotificationLog = await prisma.notificationLog.delete({
     *   where: {
     *     // ... filter to delete one NotificationLog
     *   }
     * })
     * 
     */
    delete<T extends NotificationLogDeleteArgs>(args: SelectSubset<T, NotificationLogDeleteArgs<ExtArgs>>): Prisma__NotificationLogClient<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one NotificationLog.
     * @param {NotificationLogUpdateArgs} args - Arguments to update one NotificationLog.
     * @example
     * // Update one NotificationLog
     * const notificationLog = await prisma.notificationLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationLogUpdateArgs>(args: SelectSubset<T, NotificationLogUpdateArgs<ExtArgs>>): Prisma__NotificationLogClient<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more NotificationLogs.
     * @param {NotificationLogDeleteManyArgs} args - Arguments to filter NotificationLogs to delete.
     * @example
     * // Delete a few NotificationLogs
     * const { count } = await prisma.notificationLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationLogDeleteManyArgs>(args?: SelectSubset<T, NotificationLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more NotificationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many NotificationLogs
     * const notificationLog = await prisma.notificationLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationLogUpdateManyArgs>(args: SelectSubset<T, NotificationLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one NotificationLog.
     * @param {NotificationLogUpsertArgs} args - Arguments to update or create a NotificationLog.
     * @example
     * // Update or create a NotificationLog
     * const notificationLog = await prisma.notificationLog.upsert({
     *   create: {
     *     // ... data to create a NotificationLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the NotificationLog we want to update
     *   }
     * })
     */
    upsert<T extends NotificationLogUpsertArgs>(args: SelectSubset<T, NotificationLogUpsertArgs<ExtArgs>>): Prisma__NotificationLogClient<$Result.GetResult<Prisma.$NotificationLogPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of NotificationLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationLogCountArgs} args - Arguments to filter NotificationLogs to count.
     * @example
     * // Count the number of NotificationLogs
     * const count = await prisma.notificationLog.count({
     *   where: {
     *     // ... the filter for the NotificationLogs we want to count
     *   }
     * })
    **/
    count<T extends NotificationLogCountArgs>(
      args?: Subset<T, NotificationLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a NotificationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends NotificationLogAggregateArgs>(args: Subset<T, NotificationLogAggregateArgs>): Prisma.PrismaPromise<GetNotificationLogAggregateType<T>>

    /**
     * Group by NotificationLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends NotificationLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationLogGroupByArgs['orderBy'] }
        : { orderBy?: NotificationLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, NotificationLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the NotificationLog model
   */
  readonly fields: NotificationLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for NotificationLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the NotificationLog model
   */ 
  interface NotificationLogFieldRefs {
    readonly id: FieldRef<"NotificationLog", 'String'>
    readonly tripId: FieldRef<"NotificationLog", 'String'>
    readonly tripStopId: FieldRef<"NotificationLog", 'String'>
    readonly studentId: FieldRef<"NotificationLog", 'String'>
    readonly type: FieldRef<"NotificationLog", 'String'>
    readonly status: FieldRef<"NotificationLog", 'String'>
    readonly etaSeconds: FieldRef<"NotificationLog", 'Int'>
    readonly sentAt: FieldRef<"NotificationLog", 'DateTime'>
    readonly createdAt: FieldRef<"NotificationLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * NotificationLog findUnique
   */
  export type NotificationLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * Filter, which NotificationLog to fetch.
     */
    where: NotificationLogWhereUniqueInput
  }

  /**
   * NotificationLog findUniqueOrThrow
   */
  export type NotificationLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * Filter, which NotificationLog to fetch.
     */
    where: NotificationLogWhereUniqueInput
  }

  /**
   * NotificationLog findFirst
   */
  export type NotificationLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * Filter, which NotificationLog to fetch.
     */
    where?: NotificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NotificationLogs to fetch.
     */
    orderBy?: NotificationLogOrderByWithRelationInput | NotificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NotificationLogs.
     */
    cursor?: NotificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NotificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NotificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NotificationLogs.
     */
    distinct?: NotificationLogScalarFieldEnum | NotificationLogScalarFieldEnum[]
  }

  /**
   * NotificationLog findFirstOrThrow
   */
  export type NotificationLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * Filter, which NotificationLog to fetch.
     */
    where?: NotificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NotificationLogs to fetch.
     */
    orderBy?: NotificationLogOrderByWithRelationInput | NotificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for NotificationLogs.
     */
    cursor?: NotificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NotificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NotificationLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of NotificationLogs.
     */
    distinct?: NotificationLogScalarFieldEnum | NotificationLogScalarFieldEnum[]
  }

  /**
   * NotificationLog findMany
   */
  export type NotificationLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * Filter, which NotificationLogs to fetch.
     */
    where?: NotificationLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of NotificationLogs to fetch.
     */
    orderBy?: NotificationLogOrderByWithRelationInput | NotificationLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing NotificationLogs.
     */
    cursor?: NotificationLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` NotificationLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` NotificationLogs.
     */
    skip?: number
    distinct?: NotificationLogScalarFieldEnum | NotificationLogScalarFieldEnum[]
  }

  /**
   * NotificationLog create
   */
  export type NotificationLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * The data needed to create a NotificationLog.
     */
    data: XOR<NotificationLogCreateInput, NotificationLogUncheckedCreateInput>
  }

  /**
   * NotificationLog createMany
   */
  export type NotificationLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many NotificationLogs.
     */
    data: NotificationLogCreateManyInput | NotificationLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NotificationLog createManyAndReturn
   */
  export type NotificationLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many NotificationLogs.
     */
    data: NotificationLogCreateManyInput | NotificationLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * NotificationLog update
   */
  export type NotificationLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * The data needed to update a NotificationLog.
     */
    data: XOR<NotificationLogUpdateInput, NotificationLogUncheckedUpdateInput>
    /**
     * Choose, which NotificationLog to update.
     */
    where: NotificationLogWhereUniqueInput
  }

  /**
   * NotificationLog updateMany
   */
  export type NotificationLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update NotificationLogs.
     */
    data: XOR<NotificationLogUpdateManyMutationInput, NotificationLogUncheckedUpdateManyInput>
    /**
     * Filter which NotificationLogs to update
     */
    where?: NotificationLogWhereInput
  }

  /**
   * NotificationLog upsert
   */
  export type NotificationLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * The filter to search for the NotificationLog to update in case it exists.
     */
    where: NotificationLogWhereUniqueInput
    /**
     * In case the NotificationLog found by the `where` argument doesn't exist, create a new NotificationLog with this data.
     */
    create: XOR<NotificationLogCreateInput, NotificationLogUncheckedCreateInput>
    /**
     * In case the NotificationLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationLogUpdateInput, NotificationLogUncheckedUpdateInput>
  }

  /**
   * NotificationLog delete
   */
  export type NotificationLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
    /**
     * Filter which NotificationLog to delete.
     */
    where: NotificationLogWhereUniqueInput
  }

  /**
   * NotificationLog deleteMany
   */
  export type NotificationLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which NotificationLogs to delete
     */
    where?: NotificationLogWhereInput
  }

  /**
   * NotificationLog without action
   */
  export type NotificationLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the NotificationLog
     */
    select?: NotificationLogSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    phone: 'phone',
    name: 'name',
    role: 'role',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    fcmToken: 'fcmToken'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const BusScalarFieldEnum: {
    id: 'id',
    busNo: 'busNo',
    driverName: 'driverName',
    status: 'status',
    createdAt: 'createdAt',
    label: 'label'
  };

  export type BusScalarFieldEnum = (typeof BusScalarFieldEnum)[keyof typeof BusScalarFieldEnum]


  export const LiveLocationScalarFieldEnum: {
    id: 'id',
    busId: 'busId',
    lat: 'lat',
    lng: 'lng',
    speed: 'speed',
    timestamp: 'timestamp'
  };

  export type LiveLocationScalarFieldEnum = (typeof LiveLocationScalarFieldEnum)[keyof typeof LiveLocationScalarFieldEnum]


  export const StopScalarFieldEnum: {
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

  export type StopScalarFieldEnum = (typeof StopScalarFieldEnum)[keyof typeof StopScalarFieldEnum]


  export const SchoolScalarFieldEnum: {
    id: 'id',
    name: 'name',
    address: 'address',
    lat: 'lat',
    lng: 'lng',
    updatedAt: 'updatedAt',
    contactPhone: 'contactPhone'
  };

  export type SchoolScalarFieldEnum = (typeof SchoolScalarFieldEnum)[keyof typeof SchoolScalarFieldEnum]


  export const AdminScalarFieldEnum: {
    id: 'id',
    email: 'email',
    password: 'password',
    name: 'name',
    createdAt: 'createdAt'
  };

  export type AdminScalarFieldEnum = (typeof AdminScalarFieldEnum)[keyof typeof AdminScalarFieldEnum]


  export const AttendanceScalarFieldEnum: {
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

  export type AttendanceScalarFieldEnum = (typeof AttendanceScalarFieldEnum)[keyof typeof AttendanceScalarFieldEnum]


  export const DriverScalarFieldEnum: {
    id: 'id',
    name: 'name',
    phone: 'phone',
    busId: 'busId',
    createdAt: 'createdAt',
    licenseNo: 'licenseNo',
    licenseExpiry: 'licenseExpiry',
    experience: 'experience'
  };

  export type DriverScalarFieldEnum = (typeof DriverScalarFieldEnum)[keyof typeof DriverScalarFieldEnum]


  export const ConductorScalarFieldEnum: {
    id: 'id',
    name: 'name',
    phone: 'phone',
    busId: 'busId',
    createdAt: 'createdAt'
  };

  export type ConductorScalarFieldEnum = (typeof ConductorScalarFieldEnum)[keyof typeof ConductorScalarFieldEnum]


  export const EmergencyScalarFieldEnum: {
    id: 'id',
    busId: 'busId',
    driverName: 'driverName',
    type: 'type',
    notes: 'notes',
    status: 'status',
    createdAt: 'createdAt'
  };

  export type EmergencyScalarFieldEnum = (typeof EmergencyScalarFieldEnum)[keyof typeof EmergencyScalarFieldEnum]


  export const StudentScalarFieldEnum: {
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

  export type StudentScalarFieldEnum = (typeof StudentScalarFieldEnum)[keyof typeof StudentScalarFieldEnum]


  export const RouteScalarFieldEnum: {
    id: 'id',
    name: 'name',
    busId: 'busId',
    startPoint: 'startPoint',
    endPoint: 'endPoint',
    createdAt: 'createdAt'
  };

  export type RouteScalarFieldEnum = (typeof RouteScalarFieldEnum)[keyof typeof RouteScalarFieldEnum]


  export const RouteStopScalarFieldEnum: {
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

  export type RouteStopScalarFieldEnum = (typeof RouteStopScalarFieldEnum)[keyof typeof RouteStopScalarFieldEnum]


  export const TripScalarFieldEnum: {
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

  export type TripScalarFieldEnum = (typeof TripScalarFieldEnum)[keyof typeof TripScalarFieldEnum]


  export const TripStopScalarFieldEnum: {
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

  export type TripStopScalarFieldEnum = (typeof TripStopScalarFieldEnum)[keyof typeof TripStopScalarFieldEnum]


  export const NotificationLogScalarFieldEnum: {
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

  export type NotificationLogScalarFieldEnum = (typeof NotificationLogScalarFieldEnum)[keyof typeof NotificationLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'BusStatus'
   */
  export type EnumBusStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BusStatus'>
    


  /**
   * Reference to a field of type 'BusStatus[]'
   */
  export type ListEnumBusStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'BusStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'TripDirection'
   */
  export type EnumTripDirectionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TripDirection'>
    


  /**
   * Reference to a field of type 'TripDirection[]'
   */
  export type ListEnumTripDirectionFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TripDirection[]'>
    


  /**
   * Reference to a field of type 'TripStatus'
   */
  export type EnumTripStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TripStatus'>
    


  /**
   * Reference to a field of type 'TripStatus[]'
   */
  export type ListEnumTripStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TripStatus[]'>
    


  /**
   * Reference to a field of type 'TripStopStatus'
   */
  export type EnumTripStopStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TripStopStatus'>
    


  /**
   * Reference to a field of type 'TripStopStatus[]'
   */
  export type ListEnumTripStopStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TripStopStatus[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    phone?: StringFilter<"User"> | string
    name?: StringNullableFilter<"User"> | string | null
    role?: EnumRoleFilter<"User"> | $Enums.Role
    password?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    fcmToken?: StringNullableFilter<"User"> | string | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrderInput | SortOrder
    role?: SortOrder
    password?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fcmToken?: SortOrderInput | SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    phone?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    role?: EnumRoleFilter<"User"> | $Enums.Role
    password?: StringNullableFilter<"User"> | string | null
    createdAt?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeFilter<"User"> | Date | string
    fcmToken?: StringNullableFilter<"User"> | string | null
  }, "id" | "phone">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrderInput | SortOrder
    role?: SortOrder
    password?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fcmToken?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    phone?: StringWithAggregatesFilter<"User"> | string
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    password?: StringNullableWithAggregatesFilter<"User"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"User"> | Date | string
    fcmToken?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type BusWhereInput = {
    AND?: BusWhereInput | BusWhereInput[]
    OR?: BusWhereInput[]
    NOT?: BusWhereInput | BusWhereInput[]
    id?: StringFilter<"Bus"> | string
    busNo?: StringFilter<"Bus"> | string
    driverName?: StringFilter<"Bus"> | string
    status?: EnumBusStatusFilter<"Bus"> | $Enums.BusStatus
    createdAt?: DateTimeFilter<"Bus"> | Date | string
    label?: StringNullableFilter<"Bus"> | string | null
  }

  export type BusOrderByWithRelationInput = {
    id?: SortOrder
    busNo?: SortOrder
    driverName?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    label?: SortOrderInput | SortOrder
  }

  export type BusWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    busNo?: string
    AND?: BusWhereInput | BusWhereInput[]
    OR?: BusWhereInput[]
    NOT?: BusWhereInput | BusWhereInput[]
    driverName?: StringFilter<"Bus"> | string
    status?: EnumBusStatusFilter<"Bus"> | $Enums.BusStatus
    createdAt?: DateTimeFilter<"Bus"> | Date | string
    label?: StringNullableFilter<"Bus"> | string | null
  }, "id" | "busNo">

  export type BusOrderByWithAggregationInput = {
    id?: SortOrder
    busNo?: SortOrder
    driverName?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    label?: SortOrderInput | SortOrder
    _count?: BusCountOrderByAggregateInput
    _max?: BusMaxOrderByAggregateInput
    _min?: BusMinOrderByAggregateInput
  }

  export type BusScalarWhereWithAggregatesInput = {
    AND?: BusScalarWhereWithAggregatesInput | BusScalarWhereWithAggregatesInput[]
    OR?: BusScalarWhereWithAggregatesInput[]
    NOT?: BusScalarWhereWithAggregatesInput | BusScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Bus"> | string
    busNo?: StringWithAggregatesFilter<"Bus"> | string
    driverName?: StringWithAggregatesFilter<"Bus"> | string
    status?: EnumBusStatusWithAggregatesFilter<"Bus"> | $Enums.BusStatus
    createdAt?: DateTimeWithAggregatesFilter<"Bus"> | Date | string
    label?: StringNullableWithAggregatesFilter<"Bus"> | string | null
  }

  export type LiveLocationWhereInput = {
    AND?: LiveLocationWhereInput | LiveLocationWhereInput[]
    OR?: LiveLocationWhereInput[]
    NOT?: LiveLocationWhereInput | LiveLocationWhereInput[]
    id?: StringFilter<"LiveLocation"> | string
    busId?: StringFilter<"LiveLocation"> | string
    lat?: FloatFilter<"LiveLocation"> | number
    lng?: FloatFilter<"LiveLocation"> | number
    speed?: FloatFilter<"LiveLocation"> | number
    timestamp?: DateTimeFilter<"LiveLocation"> | Date | string
  }

  export type LiveLocationOrderByWithRelationInput = {
    id?: SortOrder
    busId?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    speed?: SortOrder
    timestamp?: SortOrder
  }

  export type LiveLocationWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: LiveLocationWhereInput | LiveLocationWhereInput[]
    OR?: LiveLocationWhereInput[]
    NOT?: LiveLocationWhereInput | LiveLocationWhereInput[]
    busId?: StringFilter<"LiveLocation"> | string
    lat?: FloatFilter<"LiveLocation"> | number
    lng?: FloatFilter<"LiveLocation"> | number
    speed?: FloatFilter<"LiveLocation"> | number
    timestamp?: DateTimeFilter<"LiveLocation"> | Date | string
  }, "id">

  export type LiveLocationOrderByWithAggregationInput = {
    id?: SortOrder
    busId?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    speed?: SortOrder
    timestamp?: SortOrder
    _count?: LiveLocationCountOrderByAggregateInput
    _avg?: LiveLocationAvgOrderByAggregateInput
    _max?: LiveLocationMaxOrderByAggregateInput
    _min?: LiveLocationMinOrderByAggregateInput
    _sum?: LiveLocationSumOrderByAggregateInput
  }

  export type LiveLocationScalarWhereWithAggregatesInput = {
    AND?: LiveLocationScalarWhereWithAggregatesInput | LiveLocationScalarWhereWithAggregatesInput[]
    OR?: LiveLocationScalarWhereWithAggregatesInput[]
    NOT?: LiveLocationScalarWhereWithAggregatesInput | LiveLocationScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"LiveLocation"> | string
    busId?: StringWithAggregatesFilter<"LiveLocation"> | string
    lat?: FloatWithAggregatesFilter<"LiveLocation"> | number
    lng?: FloatWithAggregatesFilter<"LiveLocation"> | number
    speed?: FloatWithAggregatesFilter<"LiveLocation"> | number
    timestamp?: DateTimeWithAggregatesFilter<"LiveLocation"> | Date | string
  }

  export type StopWhereInput = {
    AND?: StopWhereInput | StopWhereInput[]
    OR?: StopWhereInput[]
    NOT?: StopWhereInput | StopWhereInput[]
    id?: StringFilter<"Stop"> | string
    name?: StringFilter<"Stop"> | string
    lat?: FloatFilter<"Stop"> | number
    lng?: FloatFilter<"Stop"> | number
    busId?: StringFilter<"Stop"> | string
    order?: IntFilter<"Stop"> | number
    needsLocation?: BoolFilter<"Stop"> | boolean
    direction?: EnumTripDirectionFilter<"Stop"> | $Enums.TripDirection
    studentId?: StringNullableFilter<"Stop"> | string | null
  }

  export type StopOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    busId?: SortOrder
    order?: SortOrder
    needsLocation?: SortOrder
    direction?: SortOrder
    studentId?: SortOrderInput | SortOrder
  }

  export type StopWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StopWhereInput | StopWhereInput[]
    OR?: StopWhereInput[]
    NOT?: StopWhereInput | StopWhereInput[]
    name?: StringFilter<"Stop"> | string
    lat?: FloatFilter<"Stop"> | number
    lng?: FloatFilter<"Stop"> | number
    busId?: StringFilter<"Stop"> | string
    order?: IntFilter<"Stop"> | number
    needsLocation?: BoolFilter<"Stop"> | boolean
    direction?: EnumTripDirectionFilter<"Stop"> | $Enums.TripDirection
    studentId?: StringNullableFilter<"Stop"> | string | null
  }, "id">

  export type StopOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    busId?: SortOrder
    order?: SortOrder
    needsLocation?: SortOrder
    direction?: SortOrder
    studentId?: SortOrderInput | SortOrder
    _count?: StopCountOrderByAggregateInput
    _avg?: StopAvgOrderByAggregateInput
    _max?: StopMaxOrderByAggregateInput
    _min?: StopMinOrderByAggregateInput
    _sum?: StopSumOrderByAggregateInput
  }

  export type StopScalarWhereWithAggregatesInput = {
    AND?: StopScalarWhereWithAggregatesInput | StopScalarWhereWithAggregatesInput[]
    OR?: StopScalarWhereWithAggregatesInput[]
    NOT?: StopScalarWhereWithAggregatesInput | StopScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Stop"> | string
    name?: StringWithAggregatesFilter<"Stop"> | string
    lat?: FloatWithAggregatesFilter<"Stop"> | number
    lng?: FloatWithAggregatesFilter<"Stop"> | number
    busId?: StringWithAggregatesFilter<"Stop"> | string
    order?: IntWithAggregatesFilter<"Stop"> | number
    needsLocation?: BoolWithAggregatesFilter<"Stop"> | boolean
    direction?: EnumTripDirectionWithAggregatesFilter<"Stop"> | $Enums.TripDirection
    studentId?: StringNullableWithAggregatesFilter<"Stop"> | string | null
  }

  export type SchoolWhereInput = {
    AND?: SchoolWhereInput | SchoolWhereInput[]
    OR?: SchoolWhereInput[]
    NOT?: SchoolWhereInput | SchoolWhereInput[]
    id?: StringFilter<"School"> | string
    name?: StringFilter<"School"> | string
    address?: StringNullableFilter<"School"> | string | null
    lat?: FloatFilter<"School"> | number
    lng?: FloatFilter<"School"> | number
    updatedAt?: DateTimeFilter<"School"> | Date | string
    contactPhone?: StringNullableFilter<"School"> | string | null
  }

  export type SchoolOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    lat?: SortOrder
    lng?: SortOrder
    updatedAt?: SortOrder
    contactPhone?: SortOrderInput | SortOrder
  }

  export type SchoolWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SchoolWhereInput | SchoolWhereInput[]
    OR?: SchoolWhereInput[]
    NOT?: SchoolWhereInput | SchoolWhereInput[]
    name?: StringFilter<"School"> | string
    address?: StringNullableFilter<"School"> | string | null
    lat?: FloatFilter<"School"> | number
    lng?: FloatFilter<"School"> | number
    updatedAt?: DateTimeFilter<"School"> | Date | string
    contactPhone?: StringNullableFilter<"School"> | string | null
  }, "id">

  export type SchoolOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrderInput | SortOrder
    lat?: SortOrder
    lng?: SortOrder
    updatedAt?: SortOrder
    contactPhone?: SortOrderInput | SortOrder
    _count?: SchoolCountOrderByAggregateInput
    _avg?: SchoolAvgOrderByAggregateInput
    _max?: SchoolMaxOrderByAggregateInput
    _min?: SchoolMinOrderByAggregateInput
    _sum?: SchoolSumOrderByAggregateInput
  }

  export type SchoolScalarWhereWithAggregatesInput = {
    AND?: SchoolScalarWhereWithAggregatesInput | SchoolScalarWhereWithAggregatesInput[]
    OR?: SchoolScalarWhereWithAggregatesInput[]
    NOT?: SchoolScalarWhereWithAggregatesInput | SchoolScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"School"> | string
    name?: StringWithAggregatesFilter<"School"> | string
    address?: StringNullableWithAggregatesFilter<"School"> | string | null
    lat?: FloatWithAggregatesFilter<"School"> | number
    lng?: FloatWithAggregatesFilter<"School"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"School"> | Date | string
    contactPhone?: StringNullableWithAggregatesFilter<"School"> | string | null
  }

  export type AdminWhereInput = {
    AND?: AdminWhereInput | AdminWhereInput[]
    OR?: AdminWhereInput[]
    NOT?: AdminWhereInput | AdminWhereInput[]
    id?: StringFilter<"Admin"> | string
    email?: StringFilter<"Admin"> | string
    password?: StringFilter<"Admin"> | string
    name?: StringFilter<"Admin"> | string
    createdAt?: DateTimeFilter<"Admin"> | Date | string
  }

  export type AdminOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type AdminWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: AdminWhereInput | AdminWhereInput[]
    OR?: AdminWhereInput[]
    NOT?: AdminWhereInput | AdminWhereInput[]
    password?: StringFilter<"Admin"> | string
    name?: StringFilter<"Admin"> | string
    createdAt?: DateTimeFilter<"Admin"> | Date | string
  }, "id" | "email">

  export type AdminOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
    _count?: AdminCountOrderByAggregateInput
    _max?: AdminMaxOrderByAggregateInput
    _min?: AdminMinOrderByAggregateInput
  }

  export type AdminScalarWhereWithAggregatesInput = {
    AND?: AdminScalarWhereWithAggregatesInput | AdminScalarWhereWithAggregatesInput[]
    OR?: AdminScalarWhereWithAggregatesInput[]
    NOT?: AdminScalarWhereWithAggregatesInput | AdminScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Admin"> | string
    email?: StringWithAggregatesFilter<"Admin"> | string
    password?: StringWithAggregatesFilter<"Admin"> | string
    name?: StringWithAggregatesFilter<"Admin"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Admin"> | Date | string
  }

  export type AttendanceWhereInput = {
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    id?: StringFilter<"Attendance"> | string
    busId?: StringFilter<"Attendance"> | string
    studentId?: StringFilter<"Attendance"> | string
    date?: StringFilter<"Attendance"> | string
    tripType?: StringFilter<"Attendance"> | string
    boarded?: BoolNullableFilter<"Attendance"> | boolean | null
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
    tripId?: StringNullableFilter<"Attendance"> | string | null
    conductorId?: StringNullableFilter<"Attendance"> | string | null
    checkedAt?: DateTimeNullableFilter<"Attendance"> | Date | string | null
    type?: StringNullableFilter<"Attendance"> | string | null
  }

  export type AttendanceOrderByWithRelationInput = {
    id?: SortOrder
    busId?: SortOrder
    studentId?: SortOrder
    date?: SortOrder
    tripType?: SortOrder
    boarded?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    tripId?: SortOrderInput | SortOrder
    conductorId?: SortOrderInput | SortOrder
    checkedAt?: SortOrderInput | SortOrder
    type?: SortOrderInput | SortOrder
  }

  export type AttendanceWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tripId_studentId_type?: AttendanceTripIdStudentIdTypeCompoundUniqueInput
    AND?: AttendanceWhereInput | AttendanceWhereInput[]
    OR?: AttendanceWhereInput[]
    NOT?: AttendanceWhereInput | AttendanceWhereInput[]
    busId?: StringFilter<"Attendance"> | string
    studentId?: StringFilter<"Attendance"> | string
    date?: StringFilter<"Attendance"> | string
    tripType?: StringFilter<"Attendance"> | string
    boarded?: BoolNullableFilter<"Attendance"> | boolean | null
    createdAt?: DateTimeFilter<"Attendance"> | Date | string
    tripId?: StringNullableFilter<"Attendance"> | string | null
    conductorId?: StringNullableFilter<"Attendance"> | string | null
    checkedAt?: DateTimeNullableFilter<"Attendance"> | Date | string | null
    type?: StringNullableFilter<"Attendance"> | string | null
  }, "id" | "tripId_studentId_type">

  export type AttendanceOrderByWithAggregationInput = {
    id?: SortOrder
    busId?: SortOrder
    studentId?: SortOrder
    date?: SortOrder
    tripType?: SortOrder
    boarded?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    tripId?: SortOrderInput | SortOrder
    conductorId?: SortOrderInput | SortOrder
    checkedAt?: SortOrderInput | SortOrder
    type?: SortOrderInput | SortOrder
    _count?: AttendanceCountOrderByAggregateInput
    _max?: AttendanceMaxOrderByAggregateInput
    _min?: AttendanceMinOrderByAggregateInput
  }

  export type AttendanceScalarWhereWithAggregatesInput = {
    AND?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    OR?: AttendanceScalarWhereWithAggregatesInput[]
    NOT?: AttendanceScalarWhereWithAggregatesInput | AttendanceScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Attendance"> | string
    busId?: StringWithAggregatesFilter<"Attendance"> | string
    studentId?: StringWithAggregatesFilter<"Attendance"> | string
    date?: StringWithAggregatesFilter<"Attendance"> | string
    tripType?: StringWithAggregatesFilter<"Attendance"> | string
    boarded?: BoolNullableWithAggregatesFilter<"Attendance"> | boolean | null
    createdAt?: DateTimeWithAggregatesFilter<"Attendance"> | Date | string
    tripId?: StringNullableWithAggregatesFilter<"Attendance"> | string | null
    conductorId?: StringNullableWithAggregatesFilter<"Attendance"> | string | null
    checkedAt?: DateTimeNullableWithAggregatesFilter<"Attendance"> | Date | string | null
    type?: StringNullableWithAggregatesFilter<"Attendance"> | string | null
  }

  export type DriverWhereInput = {
    AND?: DriverWhereInput | DriverWhereInput[]
    OR?: DriverWhereInput[]
    NOT?: DriverWhereInput | DriverWhereInput[]
    id?: StringFilter<"Driver"> | string
    name?: StringFilter<"Driver"> | string
    phone?: StringFilter<"Driver"> | string
    busId?: StringNullableFilter<"Driver"> | string | null
    createdAt?: DateTimeFilter<"Driver"> | Date | string
    licenseNo?: StringNullableFilter<"Driver"> | string | null
    licenseExpiry?: StringNullableFilter<"Driver"> | string | null
    experience?: IntNullableFilter<"Driver"> | number | null
  }

  export type DriverOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    licenseNo?: SortOrderInput | SortOrder
    licenseExpiry?: SortOrderInput | SortOrder
    experience?: SortOrderInput | SortOrder
  }

  export type DriverWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DriverWhereInput | DriverWhereInput[]
    OR?: DriverWhereInput[]
    NOT?: DriverWhereInput | DriverWhereInput[]
    name?: StringFilter<"Driver"> | string
    phone?: StringFilter<"Driver"> | string
    busId?: StringNullableFilter<"Driver"> | string | null
    createdAt?: DateTimeFilter<"Driver"> | Date | string
    licenseNo?: StringNullableFilter<"Driver"> | string | null
    licenseExpiry?: StringNullableFilter<"Driver"> | string | null
    experience?: IntNullableFilter<"Driver"> | number | null
  }, "id">

  export type DriverOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    licenseNo?: SortOrderInput | SortOrder
    licenseExpiry?: SortOrderInput | SortOrder
    experience?: SortOrderInput | SortOrder
    _count?: DriverCountOrderByAggregateInput
    _avg?: DriverAvgOrderByAggregateInput
    _max?: DriverMaxOrderByAggregateInput
    _min?: DriverMinOrderByAggregateInput
    _sum?: DriverSumOrderByAggregateInput
  }

  export type DriverScalarWhereWithAggregatesInput = {
    AND?: DriverScalarWhereWithAggregatesInput | DriverScalarWhereWithAggregatesInput[]
    OR?: DriverScalarWhereWithAggregatesInput[]
    NOT?: DriverScalarWhereWithAggregatesInput | DriverScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Driver"> | string
    name?: StringWithAggregatesFilter<"Driver"> | string
    phone?: StringWithAggregatesFilter<"Driver"> | string
    busId?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Driver"> | Date | string
    licenseNo?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    licenseExpiry?: StringNullableWithAggregatesFilter<"Driver"> | string | null
    experience?: IntNullableWithAggregatesFilter<"Driver"> | number | null
  }

  export type ConductorWhereInput = {
    AND?: ConductorWhereInput | ConductorWhereInput[]
    OR?: ConductorWhereInput[]
    NOT?: ConductorWhereInput | ConductorWhereInput[]
    id?: StringFilter<"Conductor"> | string
    name?: StringFilter<"Conductor"> | string
    phone?: StringFilter<"Conductor"> | string
    busId?: StringNullableFilter<"Conductor"> | string | null
    createdAt?: DateTimeFilter<"Conductor"> | Date | string
  }

  export type ConductorOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type ConductorWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ConductorWhereInput | ConductorWhereInput[]
    OR?: ConductorWhereInput[]
    NOT?: ConductorWhereInput | ConductorWhereInput[]
    name?: StringFilter<"Conductor"> | string
    phone?: StringFilter<"Conductor"> | string
    busId?: StringNullableFilter<"Conductor"> | string | null
    createdAt?: DateTimeFilter<"Conductor"> | Date | string
  }, "id">

  export type ConductorOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ConductorCountOrderByAggregateInput
    _max?: ConductorMaxOrderByAggregateInput
    _min?: ConductorMinOrderByAggregateInput
  }

  export type ConductorScalarWhereWithAggregatesInput = {
    AND?: ConductorScalarWhereWithAggregatesInput | ConductorScalarWhereWithAggregatesInput[]
    OR?: ConductorScalarWhereWithAggregatesInput[]
    NOT?: ConductorScalarWhereWithAggregatesInput | ConductorScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Conductor"> | string
    name?: StringWithAggregatesFilter<"Conductor"> | string
    phone?: StringWithAggregatesFilter<"Conductor"> | string
    busId?: StringNullableWithAggregatesFilter<"Conductor"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Conductor"> | Date | string
  }

  export type EmergencyWhereInput = {
    AND?: EmergencyWhereInput | EmergencyWhereInput[]
    OR?: EmergencyWhereInput[]
    NOT?: EmergencyWhereInput | EmergencyWhereInput[]
    id?: StringFilter<"Emergency"> | string
    busId?: StringFilter<"Emergency"> | string
    driverName?: StringNullableFilter<"Emergency"> | string | null
    type?: StringFilter<"Emergency"> | string
    notes?: StringNullableFilter<"Emergency"> | string | null
    status?: StringNullableFilter<"Emergency"> | string | null
    createdAt?: DateTimeFilter<"Emergency"> | Date | string
  }

  export type EmergencyOrderByWithRelationInput = {
    id?: SortOrder
    busId?: SortOrder
    driverName?: SortOrderInput | SortOrder
    type?: SortOrder
    notes?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type EmergencyWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: EmergencyWhereInput | EmergencyWhereInput[]
    OR?: EmergencyWhereInput[]
    NOT?: EmergencyWhereInput | EmergencyWhereInput[]
    busId?: StringFilter<"Emergency"> | string
    driverName?: StringNullableFilter<"Emergency"> | string | null
    type?: StringFilter<"Emergency"> | string
    notes?: StringNullableFilter<"Emergency"> | string | null
    status?: StringNullableFilter<"Emergency"> | string | null
    createdAt?: DateTimeFilter<"Emergency"> | Date | string
  }, "id">

  export type EmergencyOrderByWithAggregationInput = {
    id?: SortOrder
    busId?: SortOrder
    driverName?: SortOrderInput | SortOrder
    type?: SortOrder
    notes?: SortOrderInput | SortOrder
    status?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: EmergencyCountOrderByAggregateInput
    _max?: EmergencyMaxOrderByAggregateInput
    _min?: EmergencyMinOrderByAggregateInput
  }

  export type EmergencyScalarWhereWithAggregatesInput = {
    AND?: EmergencyScalarWhereWithAggregatesInput | EmergencyScalarWhereWithAggregatesInput[]
    OR?: EmergencyScalarWhereWithAggregatesInput[]
    NOT?: EmergencyScalarWhereWithAggregatesInput | EmergencyScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Emergency"> | string
    busId?: StringWithAggregatesFilter<"Emergency"> | string
    driverName?: StringNullableWithAggregatesFilter<"Emergency"> | string | null
    type?: StringWithAggregatesFilter<"Emergency"> | string
    notes?: StringNullableWithAggregatesFilter<"Emergency"> | string | null
    status?: StringNullableWithAggregatesFilter<"Emergency"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Emergency"> | Date | string
  }

  export type StudentWhereInput = {
    AND?: StudentWhereInput | StudentWhereInput[]
    OR?: StudentWhereInput[]
    NOT?: StudentWhereInput | StudentWhereInput[]
    id?: StringFilter<"Student"> | string
    name?: StringFilter<"Student"> | string
    admissionNo?: StringFilter<"Student"> | string
    busId?: StringFilter<"Student"> | string
    parentPhone?: StringFilter<"Student"> | string
    stopId?: StringNullableFilter<"Student"> | string | null
    class?: StringNullableFilter<"Student"> | string | null
    createdAt?: DateTimeFilter<"Student"> | Date | string
    dropStopId?: StringNullableFilter<"Student"> | string | null
    parentPhone2?: StringNullableFilter<"Student"> | string | null
    fatherName?: StringNullableFilter<"Student"> | string | null
    motherName?: StringNullableFilter<"Student"> | string | null
  }

  export type StudentOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    admissionNo?: SortOrder
    busId?: SortOrder
    parentPhone?: SortOrder
    stopId?: SortOrderInput | SortOrder
    class?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    dropStopId?: SortOrderInput | SortOrder
    parentPhone2?: SortOrderInput | SortOrder
    fatherName?: SortOrderInput | SortOrder
    motherName?: SortOrderInput | SortOrder
  }

  export type StudentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: StudentWhereInput | StudentWhereInput[]
    OR?: StudentWhereInput[]
    NOT?: StudentWhereInput | StudentWhereInput[]
    name?: StringFilter<"Student"> | string
    admissionNo?: StringFilter<"Student"> | string
    busId?: StringFilter<"Student"> | string
    parentPhone?: StringFilter<"Student"> | string
    stopId?: StringNullableFilter<"Student"> | string | null
    class?: StringNullableFilter<"Student"> | string | null
    createdAt?: DateTimeFilter<"Student"> | Date | string
    dropStopId?: StringNullableFilter<"Student"> | string | null
    parentPhone2?: StringNullableFilter<"Student"> | string | null
    fatherName?: StringNullableFilter<"Student"> | string | null
    motherName?: StringNullableFilter<"Student"> | string | null
  }, "id">

  export type StudentOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    admissionNo?: SortOrder
    busId?: SortOrder
    parentPhone?: SortOrder
    stopId?: SortOrderInput | SortOrder
    class?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    dropStopId?: SortOrderInput | SortOrder
    parentPhone2?: SortOrderInput | SortOrder
    fatherName?: SortOrderInput | SortOrder
    motherName?: SortOrderInput | SortOrder
    _count?: StudentCountOrderByAggregateInput
    _max?: StudentMaxOrderByAggregateInput
    _min?: StudentMinOrderByAggregateInput
  }

  export type StudentScalarWhereWithAggregatesInput = {
    AND?: StudentScalarWhereWithAggregatesInput | StudentScalarWhereWithAggregatesInput[]
    OR?: StudentScalarWhereWithAggregatesInput[]
    NOT?: StudentScalarWhereWithAggregatesInput | StudentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Student"> | string
    name?: StringWithAggregatesFilter<"Student"> | string
    admissionNo?: StringWithAggregatesFilter<"Student"> | string
    busId?: StringWithAggregatesFilter<"Student"> | string
    parentPhone?: StringWithAggregatesFilter<"Student"> | string
    stopId?: StringNullableWithAggregatesFilter<"Student"> | string | null
    class?: StringNullableWithAggregatesFilter<"Student"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Student"> | Date | string
    dropStopId?: StringNullableWithAggregatesFilter<"Student"> | string | null
    parentPhone2?: StringNullableWithAggregatesFilter<"Student"> | string | null
    fatherName?: StringNullableWithAggregatesFilter<"Student"> | string | null
    motherName?: StringNullableWithAggregatesFilter<"Student"> | string | null
  }

  export type RouteWhereInput = {
    AND?: RouteWhereInput | RouteWhereInput[]
    OR?: RouteWhereInput[]
    NOT?: RouteWhereInput | RouteWhereInput[]
    id?: StringFilter<"Route"> | string
    name?: StringFilter<"Route"> | string
    busId?: StringFilter<"Route"> | string
    startPoint?: StringFilter<"Route"> | string
    endPoint?: StringNullableFilter<"Route"> | string | null
    createdAt?: DateTimeFilter<"Route"> | Date | string
    stops?: RouteStopListRelationFilter
  }

  export type RouteOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    busId?: SortOrder
    startPoint?: SortOrder
    endPoint?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    stops?: RouteStopOrderByRelationAggregateInput
  }

  export type RouteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RouteWhereInput | RouteWhereInput[]
    OR?: RouteWhereInput[]
    NOT?: RouteWhereInput | RouteWhereInput[]
    name?: StringFilter<"Route"> | string
    busId?: StringFilter<"Route"> | string
    startPoint?: StringFilter<"Route"> | string
    endPoint?: StringNullableFilter<"Route"> | string | null
    createdAt?: DateTimeFilter<"Route"> | Date | string
    stops?: RouteStopListRelationFilter
  }, "id">

  export type RouteOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    busId?: SortOrder
    startPoint?: SortOrder
    endPoint?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: RouteCountOrderByAggregateInput
    _max?: RouteMaxOrderByAggregateInput
    _min?: RouteMinOrderByAggregateInput
  }

  export type RouteScalarWhereWithAggregatesInput = {
    AND?: RouteScalarWhereWithAggregatesInput | RouteScalarWhereWithAggregatesInput[]
    OR?: RouteScalarWhereWithAggregatesInput[]
    NOT?: RouteScalarWhereWithAggregatesInput | RouteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Route"> | string
    name?: StringWithAggregatesFilter<"Route"> | string
    busId?: StringWithAggregatesFilter<"Route"> | string
    startPoint?: StringWithAggregatesFilter<"Route"> | string
    endPoint?: StringNullableWithAggregatesFilter<"Route"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Route"> | Date | string
  }

  export type RouteStopWhereInput = {
    AND?: RouteStopWhereInput | RouteStopWhereInput[]
    OR?: RouteStopWhereInput[]
    NOT?: RouteStopWhereInput | RouteStopWhereInput[]
    id?: StringFilter<"RouteStop"> | string
    routeId?: StringFilter<"RouteStop"> | string
    name?: StringFilter<"RouteStop"> | string
    lat?: FloatFilter<"RouteStop"> | number
    lng?: FloatFilter<"RouteStop"> | number
    order?: IntFilter<"RouteStop"> | number
    distanceFromStart?: FloatFilter<"RouteStop"> | number
    estimatedTime?: IntFilter<"RouteStop"> | number
    createdAt?: DateTimeFilter<"RouteStop"> | Date | string
    route?: XOR<RouteRelationFilter, RouteWhereInput>
  }

  export type RouteStopOrderByWithRelationInput = {
    id?: SortOrder
    routeId?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
    distanceFromStart?: SortOrder
    estimatedTime?: SortOrder
    createdAt?: SortOrder
    route?: RouteOrderByWithRelationInput
  }

  export type RouteStopWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: RouteStopWhereInput | RouteStopWhereInput[]
    OR?: RouteStopWhereInput[]
    NOT?: RouteStopWhereInput | RouteStopWhereInput[]
    routeId?: StringFilter<"RouteStop"> | string
    name?: StringFilter<"RouteStop"> | string
    lat?: FloatFilter<"RouteStop"> | number
    lng?: FloatFilter<"RouteStop"> | number
    order?: IntFilter<"RouteStop"> | number
    distanceFromStart?: FloatFilter<"RouteStop"> | number
    estimatedTime?: IntFilter<"RouteStop"> | number
    createdAt?: DateTimeFilter<"RouteStop"> | Date | string
    route?: XOR<RouteRelationFilter, RouteWhereInput>
  }, "id">

  export type RouteStopOrderByWithAggregationInput = {
    id?: SortOrder
    routeId?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
    distanceFromStart?: SortOrder
    estimatedTime?: SortOrder
    createdAt?: SortOrder
    _count?: RouteStopCountOrderByAggregateInput
    _avg?: RouteStopAvgOrderByAggregateInput
    _max?: RouteStopMaxOrderByAggregateInput
    _min?: RouteStopMinOrderByAggregateInput
    _sum?: RouteStopSumOrderByAggregateInput
  }

  export type RouteStopScalarWhereWithAggregatesInput = {
    AND?: RouteStopScalarWhereWithAggregatesInput | RouteStopScalarWhereWithAggregatesInput[]
    OR?: RouteStopScalarWhereWithAggregatesInput[]
    NOT?: RouteStopScalarWhereWithAggregatesInput | RouteStopScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"RouteStop"> | string
    routeId?: StringWithAggregatesFilter<"RouteStop"> | string
    name?: StringWithAggregatesFilter<"RouteStop"> | string
    lat?: FloatWithAggregatesFilter<"RouteStop"> | number
    lng?: FloatWithAggregatesFilter<"RouteStop"> | number
    order?: IntWithAggregatesFilter<"RouteStop"> | number
    distanceFromStart?: FloatWithAggregatesFilter<"RouteStop"> | number
    estimatedTime?: IntWithAggregatesFilter<"RouteStop"> | number
    createdAt?: DateTimeWithAggregatesFilter<"RouteStop"> | Date | string
  }

  export type TripWhereInput = {
    AND?: TripWhereInput | TripWhereInput[]
    OR?: TripWhereInput[]
    NOT?: TripWhereInput | TripWhereInput[]
    id?: StringFilter<"Trip"> | string
    busId?: StringFilter<"Trip"> | string
    driverId?: StringFilter<"Trip"> | string
    direction?: EnumTripDirectionFilter<"Trip"> | $Enums.TripDirection
    status?: EnumTripStatusFilter<"Trip"> | $Enums.TripStatus
    startedAt?: DateTimeFilter<"Trip"> | Date | string
    endedAt?: DateTimeNullableFilter<"Trip"> | Date | string | null
    lastLat?: FloatNullableFilter<"Trip"> | number | null
    lastLng?: FloatNullableFilter<"Trip"> | number | null
    lastSpeed?: FloatNullableFilter<"Trip"> | number | null
    lastHeading?: FloatNullableFilter<"Trip"> | number | null
    lastLocationAt?: DateTimeNullableFilter<"Trip"> | Date | string | null
    destName?: StringNullableFilter<"Trip"> | string | null
    destLat?: FloatNullableFilter<"Trip"> | number | null
    destLng?: FloatNullableFilter<"Trip"> | number | null
    stops?: TripStopListRelationFilter
  }

  export type TripOrderByWithRelationInput = {
    id?: SortOrder
    busId?: SortOrder
    driverId?: SortOrder
    direction?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrderInput | SortOrder
    lastLat?: SortOrderInput | SortOrder
    lastLng?: SortOrderInput | SortOrder
    lastSpeed?: SortOrderInput | SortOrder
    lastHeading?: SortOrderInput | SortOrder
    lastLocationAt?: SortOrderInput | SortOrder
    destName?: SortOrderInput | SortOrder
    destLat?: SortOrderInput | SortOrder
    destLng?: SortOrderInput | SortOrder
    stops?: TripStopOrderByRelationAggregateInput
  }

  export type TripWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TripWhereInput | TripWhereInput[]
    OR?: TripWhereInput[]
    NOT?: TripWhereInput | TripWhereInput[]
    busId?: StringFilter<"Trip"> | string
    driverId?: StringFilter<"Trip"> | string
    direction?: EnumTripDirectionFilter<"Trip"> | $Enums.TripDirection
    status?: EnumTripStatusFilter<"Trip"> | $Enums.TripStatus
    startedAt?: DateTimeFilter<"Trip"> | Date | string
    endedAt?: DateTimeNullableFilter<"Trip"> | Date | string | null
    lastLat?: FloatNullableFilter<"Trip"> | number | null
    lastLng?: FloatNullableFilter<"Trip"> | number | null
    lastSpeed?: FloatNullableFilter<"Trip"> | number | null
    lastHeading?: FloatNullableFilter<"Trip"> | number | null
    lastLocationAt?: DateTimeNullableFilter<"Trip"> | Date | string | null
    destName?: StringNullableFilter<"Trip"> | string | null
    destLat?: FloatNullableFilter<"Trip"> | number | null
    destLng?: FloatNullableFilter<"Trip"> | number | null
    stops?: TripStopListRelationFilter
  }, "id">

  export type TripOrderByWithAggregationInput = {
    id?: SortOrder
    busId?: SortOrder
    driverId?: SortOrder
    direction?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrderInput | SortOrder
    lastLat?: SortOrderInput | SortOrder
    lastLng?: SortOrderInput | SortOrder
    lastSpeed?: SortOrderInput | SortOrder
    lastHeading?: SortOrderInput | SortOrder
    lastLocationAt?: SortOrderInput | SortOrder
    destName?: SortOrderInput | SortOrder
    destLat?: SortOrderInput | SortOrder
    destLng?: SortOrderInput | SortOrder
    _count?: TripCountOrderByAggregateInput
    _avg?: TripAvgOrderByAggregateInput
    _max?: TripMaxOrderByAggregateInput
    _min?: TripMinOrderByAggregateInput
    _sum?: TripSumOrderByAggregateInput
  }

  export type TripScalarWhereWithAggregatesInput = {
    AND?: TripScalarWhereWithAggregatesInput | TripScalarWhereWithAggregatesInput[]
    OR?: TripScalarWhereWithAggregatesInput[]
    NOT?: TripScalarWhereWithAggregatesInput | TripScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Trip"> | string
    busId?: StringWithAggregatesFilter<"Trip"> | string
    driverId?: StringWithAggregatesFilter<"Trip"> | string
    direction?: EnumTripDirectionWithAggregatesFilter<"Trip"> | $Enums.TripDirection
    status?: EnumTripStatusWithAggregatesFilter<"Trip"> | $Enums.TripStatus
    startedAt?: DateTimeWithAggregatesFilter<"Trip"> | Date | string
    endedAt?: DateTimeNullableWithAggregatesFilter<"Trip"> | Date | string | null
    lastLat?: FloatNullableWithAggregatesFilter<"Trip"> | number | null
    lastLng?: FloatNullableWithAggregatesFilter<"Trip"> | number | null
    lastSpeed?: FloatNullableWithAggregatesFilter<"Trip"> | number | null
    lastHeading?: FloatNullableWithAggregatesFilter<"Trip"> | number | null
    lastLocationAt?: DateTimeNullableWithAggregatesFilter<"Trip"> | Date | string | null
    destName?: StringNullableWithAggregatesFilter<"Trip"> | string | null
    destLat?: FloatNullableWithAggregatesFilter<"Trip"> | number | null
    destLng?: FloatNullableWithAggregatesFilter<"Trip"> | number | null
  }

  export type TripStopWhereInput = {
    AND?: TripStopWhereInput | TripStopWhereInput[]
    OR?: TripStopWhereInput[]
    NOT?: TripStopWhereInput | TripStopWhereInput[]
    id?: StringFilter<"TripStop"> | string
    tripId?: StringFilter<"TripStop"> | string
    stopId?: StringFilter<"TripStop"> | string
    order?: IntFilter<"TripStop"> | number
    name?: StringFilter<"TripStop"> | string
    lat?: FloatFilter<"TripStop"> | number
    lng?: FloatFilter<"TripStop"> | number
    status?: EnumTripStopStatusFilter<"TripStop"> | $Enums.TripStopStatus
    arrivedAt?: DateTimeNullableFilter<"TripStop"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"TripStop"> | Date | string | null
    trip?: XOR<TripRelationFilter, TripWhereInput>
  }

  export type TripStopOrderByWithRelationInput = {
    id?: SortOrder
    tripId?: SortOrder
    stopId?: SortOrder
    order?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    status?: SortOrder
    arrivedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    trip?: TripOrderByWithRelationInput
  }

  export type TripStopWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: TripStopWhereInput | TripStopWhereInput[]
    OR?: TripStopWhereInput[]
    NOT?: TripStopWhereInput | TripStopWhereInput[]
    tripId?: StringFilter<"TripStop"> | string
    stopId?: StringFilter<"TripStop"> | string
    order?: IntFilter<"TripStop"> | number
    name?: StringFilter<"TripStop"> | string
    lat?: FloatFilter<"TripStop"> | number
    lng?: FloatFilter<"TripStop"> | number
    status?: EnumTripStopStatusFilter<"TripStop"> | $Enums.TripStopStatus
    arrivedAt?: DateTimeNullableFilter<"TripStop"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"TripStop"> | Date | string | null
    trip?: XOR<TripRelationFilter, TripWhereInput>
  }, "id">

  export type TripStopOrderByWithAggregationInput = {
    id?: SortOrder
    tripId?: SortOrder
    stopId?: SortOrder
    order?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    status?: SortOrder
    arrivedAt?: SortOrderInput | SortOrder
    completedAt?: SortOrderInput | SortOrder
    _count?: TripStopCountOrderByAggregateInput
    _avg?: TripStopAvgOrderByAggregateInput
    _max?: TripStopMaxOrderByAggregateInput
    _min?: TripStopMinOrderByAggregateInput
    _sum?: TripStopSumOrderByAggregateInput
  }

  export type TripStopScalarWhereWithAggregatesInput = {
    AND?: TripStopScalarWhereWithAggregatesInput | TripStopScalarWhereWithAggregatesInput[]
    OR?: TripStopScalarWhereWithAggregatesInput[]
    NOT?: TripStopScalarWhereWithAggregatesInput | TripStopScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"TripStop"> | string
    tripId?: StringWithAggregatesFilter<"TripStop"> | string
    stopId?: StringWithAggregatesFilter<"TripStop"> | string
    order?: IntWithAggregatesFilter<"TripStop"> | number
    name?: StringWithAggregatesFilter<"TripStop"> | string
    lat?: FloatWithAggregatesFilter<"TripStop"> | number
    lng?: FloatWithAggregatesFilter<"TripStop"> | number
    status?: EnumTripStopStatusWithAggregatesFilter<"TripStop"> | $Enums.TripStopStatus
    arrivedAt?: DateTimeNullableWithAggregatesFilter<"TripStop"> | Date | string | null
    completedAt?: DateTimeNullableWithAggregatesFilter<"TripStop"> | Date | string | null
  }

  export type NotificationLogWhereInput = {
    AND?: NotificationLogWhereInput | NotificationLogWhereInput[]
    OR?: NotificationLogWhereInput[]
    NOT?: NotificationLogWhereInput | NotificationLogWhereInput[]
    id?: StringFilter<"NotificationLog"> | string
    tripId?: StringFilter<"NotificationLog"> | string
    tripStopId?: StringFilter<"NotificationLog"> | string
    studentId?: StringFilter<"NotificationLog"> | string
    type?: StringFilter<"NotificationLog"> | string
    status?: StringFilter<"NotificationLog"> | string
    etaSeconds?: IntNullableFilter<"NotificationLog"> | number | null
    sentAt?: DateTimeNullableFilter<"NotificationLog"> | Date | string | null
    createdAt?: DateTimeFilter<"NotificationLog"> | Date | string
  }

  export type NotificationLogOrderByWithRelationInput = {
    id?: SortOrder
    tripId?: SortOrder
    tripStopId?: SortOrder
    studentId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    etaSeconds?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type NotificationLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    tripId_tripStopId_studentId_type?: NotificationLogTripIdTripStopIdStudentIdTypeCompoundUniqueInput
    AND?: NotificationLogWhereInput | NotificationLogWhereInput[]
    OR?: NotificationLogWhereInput[]
    NOT?: NotificationLogWhereInput | NotificationLogWhereInput[]
    tripId?: StringFilter<"NotificationLog"> | string
    tripStopId?: StringFilter<"NotificationLog"> | string
    studentId?: StringFilter<"NotificationLog"> | string
    type?: StringFilter<"NotificationLog"> | string
    status?: StringFilter<"NotificationLog"> | string
    etaSeconds?: IntNullableFilter<"NotificationLog"> | number | null
    sentAt?: DateTimeNullableFilter<"NotificationLog"> | Date | string | null
    createdAt?: DateTimeFilter<"NotificationLog"> | Date | string
  }, "id" | "tripId_tripStopId_studentId_type">

  export type NotificationLogOrderByWithAggregationInput = {
    id?: SortOrder
    tripId?: SortOrder
    tripStopId?: SortOrder
    studentId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    etaSeconds?: SortOrderInput | SortOrder
    sentAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: NotificationLogCountOrderByAggregateInput
    _avg?: NotificationLogAvgOrderByAggregateInput
    _max?: NotificationLogMaxOrderByAggregateInput
    _min?: NotificationLogMinOrderByAggregateInput
    _sum?: NotificationLogSumOrderByAggregateInput
  }

  export type NotificationLogScalarWhereWithAggregatesInput = {
    AND?: NotificationLogScalarWhereWithAggregatesInput | NotificationLogScalarWhereWithAggregatesInput[]
    OR?: NotificationLogScalarWhereWithAggregatesInput[]
    NOT?: NotificationLogScalarWhereWithAggregatesInput | NotificationLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"NotificationLog"> | string
    tripId?: StringWithAggregatesFilter<"NotificationLog"> | string
    tripStopId?: StringWithAggregatesFilter<"NotificationLog"> | string
    studentId?: StringWithAggregatesFilter<"NotificationLog"> | string
    type?: StringWithAggregatesFilter<"NotificationLog"> | string
    status?: StringWithAggregatesFilter<"NotificationLog"> | string
    etaSeconds?: IntNullableWithAggregatesFilter<"NotificationLog"> | number | null
    sentAt?: DateTimeNullableWithAggregatesFilter<"NotificationLog"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"NotificationLog"> | Date | string
  }

  export type UserCreateInput = {
    id?: string
    phone: string
    name?: string | null
    role?: $Enums.Role
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    fcmToken?: string | null
  }

  export type UserUncheckedCreateInput = {
    id?: string
    phone: string
    name?: string | null
    role?: $Enums.Role
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    fcmToken?: string | null
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fcmToken?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fcmToken?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateManyInput = {
    id?: string
    phone: string
    name?: string | null
    role?: $Enums.Role
    password?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    fcmToken?: string | null
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fcmToken?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    name?: NullableStringFieldUpdateOperationsInput | string | null
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    password?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    fcmToken?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BusCreateInput = {
    id?: string
    busNo: string
    driverName: string
    status?: $Enums.BusStatus
    createdAt?: Date | string
    label?: string | null
  }

  export type BusUncheckedCreateInput = {
    id?: string
    busNo: string
    driverName: string
    status?: $Enums.BusStatus
    createdAt?: Date | string
    label?: string | null
  }

  export type BusUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busNo?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    status?: EnumBusStatusFieldUpdateOperationsInput | $Enums.BusStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BusUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busNo?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    status?: EnumBusStatusFieldUpdateOperationsInput | $Enums.BusStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BusCreateManyInput = {
    id?: string
    busNo: string
    driverName: string
    status?: $Enums.BusStatus
    createdAt?: Date | string
    label?: string | null
  }

  export type BusUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    busNo?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    status?: EnumBusStatusFieldUpdateOperationsInput | $Enums.BusStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type BusUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    busNo?: StringFieldUpdateOperationsInput | string
    driverName?: StringFieldUpdateOperationsInput | string
    status?: EnumBusStatusFieldUpdateOperationsInput | $Enums.BusStatus
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    label?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type LiveLocationCreateInput = {
    id?: string
    busId: string
    lat: number
    lng: number
    speed?: number
    timestamp?: Date | string
  }

  export type LiveLocationUncheckedCreateInput = {
    id?: string
    busId: string
    lat: number
    lng: number
    speed?: number
    timestamp?: Date | string
  }

  export type LiveLocationUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    speed?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiveLocationUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    speed?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiveLocationCreateManyInput = {
    id?: string
    busId: string
    lat: number
    lng: number
    speed?: number
    timestamp?: Date | string
  }

  export type LiveLocationUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    speed?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LiveLocationUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    speed?: FloatFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StopCreateInput = {
    id?: string
    name: string
    lat: number
    lng: number
    busId: string
    order: number
    needsLocation?: boolean
    direction?: $Enums.TripDirection
    studentId?: string | null
  }

  export type StopUncheckedCreateInput = {
    id?: string
    name: string
    lat: number
    lng: number
    busId: string
    order: number
    needsLocation?: boolean
    direction?: $Enums.TripDirection
    studentId?: string | null
  }

  export type StopUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    busId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    needsLocation?: BoolFieldUpdateOperationsInput | boolean
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StopUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    busId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    needsLocation?: BoolFieldUpdateOperationsInput | boolean
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StopCreateManyInput = {
    id?: string
    name: string
    lat: number
    lng: number
    busId: string
    order: number
    needsLocation?: boolean
    direction?: $Enums.TripDirection
    studentId?: string | null
  }

  export type StopUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    busId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    needsLocation?: BoolFieldUpdateOperationsInput | boolean
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StopUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    busId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    needsLocation?: BoolFieldUpdateOperationsInput | boolean
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    studentId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SchoolCreateInput = {
    id?: string
    name: string
    address?: string | null
    lat: number
    lng: number
    updatedAt?: Date | string
    contactPhone?: string | null
  }

  export type SchoolUncheckedCreateInput = {
    id?: string
    name: string
    address?: string | null
    lat: number
    lng: number
    updatedAt?: Date | string
    contactPhone?: string | null
  }

  export type SchoolUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SchoolUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SchoolCreateManyInput = {
    id?: string
    name: string
    address?: string | null
    lat: number
    lng: number
    updatedAt?: Date | string
    contactPhone?: string | null
  }

  export type SchoolUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type SchoolUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    address?: NullableStringFieldUpdateOperationsInput | string | null
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    contactPhone?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AdminCreateInput = {
    id?: string
    email: string
    password: string
    name: string
    createdAt?: Date | string
  }

  export type AdminUncheckedCreateInput = {
    id?: string
    email: string
    password: string
    name: string
    createdAt?: Date | string
  }

  export type AdminUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminCreateManyInput = {
    id?: string
    email: string
    password: string
    name: string
    createdAt?: Date | string
  }

  export type AdminUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AdminUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttendanceCreateInput = {
    id?: string
    busId: string
    studentId: string
    date: string
    tripType?: string
    boarded?: boolean | null
    createdAt?: Date | string
    tripId?: string | null
    conductorId?: string | null
    checkedAt?: Date | string | null
    type?: string | null
  }

  export type AttendanceUncheckedCreateInput = {
    id?: string
    busId: string
    studentId: string
    date: string
    tripType?: string
    boarded?: boolean | null
    createdAt?: Date | string
    tripId?: string | null
    conductorId?: string | null
    checkedAt?: Date | string | null
    type?: string | null
  }

  export type AttendanceUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    boarded?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tripId?: NullableStringFieldUpdateOperationsInput | string | null
    conductorId?: NullableStringFieldUpdateOperationsInput | string | null
    checkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AttendanceUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    boarded?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tripId?: NullableStringFieldUpdateOperationsInput | string | null
    conductorId?: NullableStringFieldUpdateOperationsInput | string | null
    checkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AttendanceCreateManyInput = {
    id?: string
    busId: string
    studentId: string
    date: string
    tripType?: string
    boarded?: boolean | null
    createdAt?: Date | string
    tripId?: string | null
    conductorId?: string | null
    checkedAt?: Date | string | null
    type?: string | null
  }

  export type AttendanceUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    boarded?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tripId?: NullableStringFieldUpdateOperationsInput | string | null
    conductorId?: NullableStringFieldUpdateOperationsInput | string | null
    checkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type AttendanceUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    date?: StringFieldUpdateOperationsInput | string
    tripType?: StringFieldUpdateOperationsInput | string
    boarded?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    tripId?: NullableStringFieldUpdateOperationsInput | string | null
    conductorId?: NullableStringFieldUpdateOperationsInput | string | null
    checkedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    type?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type DriverCreateInput = {
    id?: string
    name: string
    phone: string
    busId?: string | null
    createdAt?: Date | string
    licenseNo?: string | null
    licenseExpiry?: string | null
    experience?: number | null
  }

  export type DriverUncheckedCreateInput = {
    id?: string
    name: string
    phone: string
    busId?: string | null
    createdAt?: Date | string
    licenseNo?: string | null
    licenseExpiry?: string | null
    experience?: number | null
  }

  export type DriverUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    busId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    licenseNo?: NullableStringFieldUpdateOperationsInput | string | null
    licenseExpiry?: NullableStringFieldUpdateOperationsInput | string | null
    experience?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DriverUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    busId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    licenseNo?: NullableStringFieldUpdateOperationsInput | string | null
    licenseExpiry?: NullableStringFieldUpdateOperationsInput | string | null
    experience?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DriverCreateManyInput = {
    id?: string
    name: string
    phone: string
    busId?: string | null
    createdAt?: Date | string
    licenseNo?: string | null
    licenseExpiry?: string | null
    experience?: number | null
  }

  export type DriverUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    busId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    licenseNo?: NullableStringFieldUpdateOperationsInput | string | null
    licenseExpiry?: NullableStringFieldUpdateOperationsInput | string | null
    experience?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type DriverUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    busId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    licenseNo?: NullableStringFieldUpdateOperationsInput | string | null
    licenseExpiry?: NullableStringFieldUpdateOperationsInput | string | null
    experience?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type ConductorCreateInput = {
    id?: string
    name: string
    phone: string
    busId?: string | null
    createdAt?: Date | string
  }

  export type ConductorUncheckedCreateInput = {
    id?: string
    name: string
    phone: string
    busId?: string | null
    createdAt?: Date | string
  }

  export type ConductorUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    busId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConductorUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    busId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConductorCreateManyInput = {
    id?: string
    name: string
    phone: string
    busId?: string | null
    createdAt?: Date | string
  }

  export type ConductorUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    busId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ConductorUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    busId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmergencyCreateInput = {
    id?: string
    busId: string
    driverName?: string | null
    type?: string
    notes?: string | null
    status?: string | null
    createdAt?: Date | string
  }

  export type EmergencyUncheckedCreateInput = {
    id?: string
    busId: string
    driverName?: string | null
    type?: string
    notes?: string | null
    status?: string | null
    createdAt?: Date | string
  }

  export type EmergencyUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverName?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmergencyUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverName?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmergencyCreateManyInput = {
    id?: string
    busId: string
    driverName?: string | null
    type?: string
    notes?: string | null
    status?: string | null
    createdAt?: Date | string
  }

  export type EmergencyUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverName?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type EmergencyUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverName?: NullableStringFieldUpdateOperationsInput | string | null
    type?: StringFieldUpdateOperationsInput | string
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    status?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StudentCreateInput = {
    id?: string
    name: string
    admissionNo: string
    busId: string
    parentPhone: string
    stopId?: string | null
    class?: string | null
    createdAt?: Date | string
    dropStopId?: string | null
    parentPhone2?: string | null
    fatherName?: string | null
    motherName?: string | null
  }

  export type StudentUncheckedCreateInput = {
    id?: string
    name: string
    admissionNo: string
    busId: string
    parentPhone: string
    stopId?: string | null
    class?: string | null
    createdAt?: Date | string
    dropStopId?: string | null
    parentPhone2?: string | null
    fatherName?: string | null
    motherName?: string | null
  }

  export type StudentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    admissionNo?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    parentPhone?: StringFieldUpdateOperationsInput | string
    stopId?: NullableStringFieldUpdateOperationsInput | string | null
    class?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dropStopId?: NullableStringFieldUpdateOperationsInput | string | null
    parentPhone2?: NullableStringFieldUpdateOperationsInput | string | null
    fatherName?: NullableStringFieldUpdateOperationsInput | string | null
    motherName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StudentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    admissionNo?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    parentPhone?: StringFieldUpdateOperationsInput | string
    stopId?: NullableStringFieldUpdateOperationsInput | string | null
    class?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dropStopId?: NullableStringFieldUpdateOperationsInput | string | null
    parentPhone2?: NullableStringFieldUpdateOperationsInput | string | null
    fatherName?: NullableStringFieldUpdateOperationsInput | string | null
    motherName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StudentCreateManyInput = {
    id?: string
    name: string
    admissionNo: string
    busId: string
    parentPhone: string
    stopId?: string | null
    class?: string | null
    createdAt?: Date | string
    dropStopId?: string | null
    parentPhone2?: string | null
    fatherName?: string | null
    motherName?: string | null
  }

  export type StudentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    admissionNo?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    parentPhone?: StringFieldUpdateOperationsInput | string
    stopId?: NullableStringFieldUpdateOperationsInput | string | null
    class?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dropStopId?: NullableStringFieldUpdateOperationsInput | string | null
    parentPhone2?: NullableStringFieldUpdateOperationsInput | string | null
    fatherName?: NullableStringFieldUpdateOperationsInput | string | null
    motherName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StudentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    admissionNo?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    parentPhone?: StringFieldUpdateOperationsInput | string
    stopId?: NullableStringFieldUpdateOperationsInput | string | null
    class?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    dropStopId?: NullableStringFieldUpdateOperationsInput | string | null
    parentPhone2?: NullableStringFieldUpdateOperationsInput | string | null
    fatherName?: NullableStringFieldUpdateOperationsInput | string | null
    motherName?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RouteCreateInput = {
    id?: string
    name: string
    busId: string
    startPoint: string
    endPoint?: string | null
    createdAt?: Date | string
    stops?: RouteStopCreateNestedManyWithoutRouteInput
  }

  export type RouteUncheckedCreateInput = {
    id?: string
    name: string
    busId: string
    startPoint: string
    endPoint?: string | null
    createdAt?: Date | string
    stops?: RouteStopUncheckedCreateNestedManyWithoutRouteInput
  }

  export type RouteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    startPoint?: StringFieldUpdateOperationsInput | string
    endPoint?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stops?: RouteStopUpdateManyWithoutRouteNestedInput
  }

  export type RouteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    startPoint?: StringFieldUpdateOperationsInput | string
    endPoint?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    stops?: RouteStopUncheckedUpdateManyWithoutRouteNestedInput
  }

  export type RouteCreateManyInput = {
    id?: string
    name: string
    busId: string
    startPoint: string
    endPoint?: string | null
    createdAt?: Date | string
  }

  export type RouteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    startPoint?: StringFieldUpdateOperationsInput | string
    endPoint?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    startPoint?: StringFieldUpdateOperationsInput | string
    endPoint?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteStopCreateInput = {
    id?: string
    name: string
    lat: number
    lng: number
    order: number
    distanceFromStart?: number
    estimatedTime?: number
    createdAt?: Date | string
    route: RouteCreateNestedOneWithoutStopsInput
  }

  export type RouteStopUncheckedCreateInput = {
    id?: string
    routeId: string
    name: string
    lat: number
    lng: number
    order: number
    distanceFromStart?: number
    estimatedTime?: number
    createdAt?: Date | string
  }

  export type RouteStopUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    distanceFromStart?: FloatFieldUpdateOperationsInput | number
    estimatedTime?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    route?: RouteUpdateOneRequiredWithoutStopsNestedInput
  }

  export type RouteStopUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    routeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    distanceFromStart?: FloatFieldUpdateOperationsInput | number
    estimatedTime?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteStopCreateManyInput = {
    id?: string
    routeId: string
    name: string
    lat: number
    lng: number
    order: number
    distanceFromStart?: number
    estimatedTime?: number
    createdAt?: Date | string
  }

  export type RouteStopUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    distanceFromStart?: FloatFieldUpdateOperationsInput | number
    estimatedTime?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteStopUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    routeId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    distanceFromStart?: FloatFieldUpdateOperationsInput | number
    estimatedTime?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TripCreateInput = {
    id?: string
    busId: string
    driverId: string
    direction: $Enums.TripDirection
    status?: $Enums.TripStatus
    startedAt?: Date | string
    endedAt?: Date | string | null
    lastLat?: number | null
    lastLng?: number | null
    lastSpeed?: number | null
    lastHeading?: number | null
    lastLocationAt?: Date | string | null
    destName?: string | null
    destLat?: number | null
    destLng?: number | null
    stops?: TripStopCreateNestedManyWithoutTripInput
  }

  export type TripUncheckedCreateInput = {
    id?: string
    busId: string
    driverId: string
    direction: $Enums.TripDirection
    status?: $Enums.TripStatus
    startedAt?: Date | string
    endedAt?: Date | string | null
    lastLat?: number | null
    lastLng?: number | null
    lastSpeed?: number | null
    lastHeading?: number | null
    lastLocationAt?: Date | string | null
    destName?: string | null
    destLat?: number | null
    destLng?: number | null
    stops?: TripStopUncheckedCreateNestedManyWithoutTripInput
  }

  export type TripUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    status?: EnumTripStatusFieldUpdateOperationsInput | $Enums.TripStatus
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLat?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLng?: NullableFloatFieldUpdateOperationsInput | number | null
    lastSpeed?: NullableFloatFieldUpdateOperationsInput | number | null
    lastHeading?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLocationAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destName?: NullableStringFieldUpdateOperationsInput | string | null
    destLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destLng?: NullableFloatFieldUpdateOperationsInput | number | null
    stops?: TripStopUpdateManyWithoutTripNestedInput
  }

  export type TripUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    status?: EnumTripStatusFieldUpdateOperationsInput | $Enums.TripStatus
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLat?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLng?: NullableFloatFieldUpdateOperationsInput | number | null
    lastSpeed?: NullableFloatFieldUpdateOperationsInput | number | null
    lastHeading?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLocationAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destName?: NullableStringFieldUpdateOperationsInput | string | null
    destLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destLng?: NullableFloatFieldUpdateOperationsInput | number | null
    stops?: TripStopUncheckedUpdateManyWithoutTripNestedInput
  }

  export type TripCreateManyInput = {
    id?: string
    busId: string
    driverId: string
    direction: $Enums.TripDirection
    status?: $Enums.TripStatus
    startedAt?: Date | string
    endedAt?: Date | string | null
    lastLat?: number | null
    lastLng?: number | null
    lastSpeed?: number | null
    lastHeading?: number | null
    lastLocationAt?: Date | string | null
    destName?: string | null
    destLat?: number | null
    destLng?: number | null
  }

  export type TripUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    status?: EnumTripStatusFieldUpdateOperationsInput | $Enums.TripStatus
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLat?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLng?: NullableFloatFieldUpdateOperationsInput | number | null
    lastSpeed?: NullableFloatFieldUpdateOperationsInput | number | null
    lastHeading?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLocationAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destName?: NullableStringFieldUpdateOperationsInput | string | null
    destLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destLng?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type TripUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    status?: EnumTripStatusFieldUpdateOperationsInput | $Enums.TripStatus
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLat?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLng?: NullableFloatFieldUpdateOperationsInput | number | null
    lastSpeed?: NullableFloatFieldUpdateOperationsInput | number | null
    lastHeading?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLocationAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destName?: NullableStringFieldUpdateOperationsInput | string | null
    destLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destLng?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type TripStopCreateInput = {
    id?: string
    stopId: string
    order: number
    name: string
    lat: number
    lng: number
    status?: $Enums.TripStopStatus
    arrivedAt?: Date | string | null
    completedAt?: Date | string | null
    trip: TripCreateNestedOneWithoutStopsInput
  }

  export type TripStopUncheckedCreateInput = {
    id?: string
    tripId: string
    stopId: string
    order: number
    name: string
    lat: number
    lng: number
    status?: $Enums.TripStopStatus
    arrivedAt?: Date | string | null
    completedAt?: Date | string | null
  }

  export type TripStopUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    stopId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    status?: EnumTripStopStatusFieldUpdateOperationsInput | $Enums.TripStopStatus
    arrivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    trip?: TripUpdateOneRequiredWithoutStopsNestedInput
  }

  export type TripStopUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    stopId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    status?: EnumTripStopStatusFieldUpdateOperationsInput | $Enums.TripStopStatus
    arrivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TripStopCreateManyInput = {
    id?: string
    tripId: string
    stopId: string
    order: number
    name: string
    lat: number
    lng: number
    status?: $Enums.TripStopStatus
    arrivedAt?: Date | string | null
    completedAt?: Date | string | null
  }

  export type TripStopUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    stopId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    status?: EnumTripStopStatusFieldUpdateOperationsInput | $Enums.TripStopStatus
    arrivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TripStopUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    stopId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    status?: EnumTripStopStatusFieldUpdateOperationsInput | $Enums.TripStopStatus
    arrivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type NotificationLogCreateInput = {
    id?: string
    tripId: string
    tripStopId: string
    studentId: string
    type: string
    status: string
    etaSeconds?: number | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type NotificationLogUncheckedCreateInput = {
    id?: string
    tripId: string
    tripStopId: string
    studentId: string
    type: string
    status: string
    etaSeconds?: number | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type NotificationLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    tripStopId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    etaSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    tripStopId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    etaSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationLogCreateManyInput = {
    id?: string
    tripId: string
    tripStopId: string
    studentId: string
    type: string
    status: string
    etaSeconds?: number | null
    sentAt?: Date | string | null
    createdAt?: Date | string
  }

  export type NotificationLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    tripStopId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    etaSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    tripId?: StringFieldUpdateOperationsInput | string
    tripStopId?: StringFieldUpdateOperationsInput | string
    studentId?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    etaSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    sentAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fcmToken?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fcmToken?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    phone?: SortOrder
    name?: SortOrder
    role?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    fcmToken?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumBusStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BusStatus | EnumBusStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BusStatus[] | ListEnumBusStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BusStatus[] | ListEnumBusStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBusStatusFilter<$PrismaModel> | $Enums.BusStatus
  }

  export type BusCountOrderByAggregateInput = {
    id?: SortOrder
    busNo?: SortOrder
    driverName?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    label?: SortOrder
  }

  export type BusMaxOrderByAggregateInput = {
    id?: SortOrder
    busNo?: SortOrder
    driverName?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    label?: SortOrder
  }

  export type BusMinOrderByAggregateInput = {
    id?: SortOrder
    busNo?: SortOrder
    driverName?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
    label?: SortOrder
  }

  export type EnumBusStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BusStatus | EnumBusStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BusStatus[] | ListEnumBusStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BusStatus[] | ListEnumBusStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBusStatusWithAggregatesFilter<$PrismaModel> | $Enums.BusStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBusStatusFilter<$PrismaModel>
    _max?: NestedEnumBusStatusFilter<$PrismaModel>
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type LiveLocationCountOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    speed?: SortOrder
    timestamp?: SortOrder
  }

  export type LiveLocationAvgOrderByAggregateInput = {
    lat?: SortOrder
    lng?: SortOrder
    speed?: SortOrder
  }

  export type LiveLocationMaxOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    speed?: SortOrder
    timestamp?: SortOrder
  }

  export type LiveLocationMinOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    speed?: SortOrder
    timestamp?: SortOrder
  }

  export type LiveLocationSumOrderByAggregateInput = {
    lat?: SortOrder
    lng?: SortOrder
    speed?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type EnumTripDirectionFilter<$PrismaModel = never> = {
    equals?: $Enums.TripDirection | EnumTripDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.TripDirection[] | ListEnumTripDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripDirection[] | ListEnumTripDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumTripDirectionFilter<$PrismaModel> | $Enums.TripDirection
  }

  export type StopCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    busId?: SortOrder
    order?: SortOrder
    needsLocation?: SortOrder
    direction?: SortOrder
    studentId?: SortOrder
  }

  export type StopAvgOrderByAggregateInput = {
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
  }

  export type StopMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    busId?: SortOrder
    order?: SortOrder
    needsLocation?: SortOrder
    direction?: SortOrder
    studentId?: SortOrder
  }

  export type StopMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    busId?: SortOrder
    order?: SortOrder
    needsLocation?: SortOrder
    direction?: SortOrder
    studentId?: SortOrder
  }

  export type StopSumOrderByAggregateInput = {
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type EnumTripDirectionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TripDirection | EnumTripDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.TripDirection[] | ListEnumTripDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripDirection[] | ListEnumTripDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumTripDirectionWithAggregatesFilter<$PrismaModel> | $Enums.TripDirection
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTripDirectionFilter<$PrismaModel>
    _max?: NestedEnumTripDirectionFilter<$PrismaModel>
  }

  export type SchoolCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    updatedAt?: SortOrder
    contactPhone?: SortOrder
  }

  export type SchoolAvgOrderByAggregateInput = {
    lat?: SortOrder
    lng?: SortOrder
  }

  export type SchoolMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    updatedAt?: SortOrder
    contactPhone?: SortOrder
  }

  export type SchoolMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    address?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    updatedAt?: SortOrder
    contactPhone?: SortOrder
  }

  export type SchoolSumOrderByAggregateInput = {
    lat?: SortOrder
    lng?: SortOrder
  }

  export type AdminCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type AdminMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type AdminMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    password?: SortOrder
    name?: SortOrder
    createdAt?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type AttendanceTripIdStudentIdTypeCompoundUniqueInput = {
    tripId: string
    studentId: string
    type: string
  }

  export type AttendanceCountOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    studentId?: SortOrder
    date?: SortOrder
    tripType?: SortOrder
    boarded?: SortOrder
    createdAt?: SortOrder
    tripId?: SortOrder
    conductorId?: SortOrder
    checkedAt?: SortOrder
    type?: SortOrder
  }

  export type AttendanceMaxOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    studentId?: SortOrder
    date?: SortOrder
    tripType?: SortOrder
    boarded?: SortOrder
    createdAt?: SortOrder
    tripId?: SortOrder
    conductorId?: SortOrder
    checkedAt?: SortOrder
    type?: SortOrder
  }

  export type AttendanceMinOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    studentId?: SortOrder
    date?: SortOrder
    tripType?: SortOrder
    boarded?: SortOrder
    createdAt?: SortOrder
    tripId?: SortOrder
    conductorId?: SortOrder
    checkedAt?: SortOrder
    type?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DriverCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrder
    createdAt?: SortOrder
    licenseNo?: SortOrder
    licenseExpiry?: SortOrder
    experience?: SortOrder
  }

  export type DriverAvgOrderByAggregateInput = {
    experience?: SortOrder
  }

  export type DriverMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrder
    createdAt?: SortOrder
    licenseNo?: SortOrder
    licenseExpiry?: SortOrder
    experience?: SortOrder
  }

  export type DriverMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrder
    createdAt?: SortOrder
    licenseNo?: SortOrder
    licenseExpiry?: SortOrder
    experience?: SortOrder
  }

  export type DriverSumOrderByAggregateInput = {
    experience?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type ConductorCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrder
    createdAt?: SortOrder
  }

  export type ConductorMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrder
    createdAt?: SortOrder
  }

  export type ConductorMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    phone?: SortOrder
    busId?: SortOrder
    createdAt?: SortOrder
  }

  export type EmergencyCountOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    driverName?: SortOrder
    type?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type EmergencyMaxOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    driverName?: SortOrder
    type?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type EmergencyMinOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    driverName?: SortOrder
    type?: SortOrder
    notes?: SortOrder
    status?: SortOrder
    createdAt?: SortOrder
  }

  export type StudentCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    admissionNo?: SortOrder
    busId?: SortOrder
    parentPhone?: SortOrder
    stopId?: SortOrder
    class?: SortOrder
    createdAt?: SortOrder
    dropStopId?: SortOrder
    parentPhone2?: SortOrder
    fatherName?: SortOrder
    motherName?: SortOrder
  }

  export type StudentMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    admissionNo?: SortOrder
    busId?: SortOrder
    parentPhone?: SortOrder
    stopId?: SortOrder
    class?: SortOrder
    createdAt?: SortOrder
    dropStopId?: SortOrder
    parentPhone2?: SortOrder
    fatherName?: SortOrder
    motherName?: SortOrder
  }

  export type StudentMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    admissionNo?: SortOrder
    busId?: SortOrder
    parentPhone?: SortOrder
    stopId?: SortOrder
    class?: SortOrder
    createdAt?: SortOrder
    dropStopId?: SortOrder
    parentPhone2?: SortOrder
    fatherName?: SortOrder
    motherName?: SortOrder
  }

  export type RouteStopListRelationFilter = {
    every?: RouteStopWhereInput
    some?: RouteStopWhereInput
    none?: RouteStopWhereInput
  }

  export type RouteStopOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type RouteCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    busId?: SortOrder
    startPoint?: SortOrder
    endPoint?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    busId?: SortOrder
    startPoint?: SortOrder
    endPoint?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    busId?: SortOrder
    startPoint?: SortOrder
    endPoint?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteRelationFilter = {
    is?: RouteWhereInput
    isNot?: RouteWhereInput
  }

  export type RouteStopCountOrderByAggregateInput = {
    id?: SortOrder
    routeId?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
    distanceFromStart?: SortOrder
    estimatedTime?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteStopAvgOrderByAggregateInput = {
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
    distanceFromStart?: SortOrder
    estimatedTime?: SortOrder
  }

  export type RouteStopMaxOrderByAggregateInput = {
    id?: SortOrder
    routeId?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
    distanceFromStart?: SortOrder
    estimatedTime?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteStopMinOrderByAggregateInput = {
    id?: SortOrder
    routeId?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
    distanceFromStart?: SortOrder
    estimatedTime?: SortOrder
    createdAt?: SortOrder
  }

  export type RouteStopSumOrderByAggregateInput = {
    lat?: SortOrder
    lng?: SortOrder
    order?: SortOrder
    distanceFromStart?: SortOrder
    estimatedTime?: SortOrder
  }

  export type EnumTripStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TripStatus | EnumTripStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TripStatus[] | ListEnumTripStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripStatus[] | ListEnumTripStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTripStatusFilter<$PrismaModel> | $Enums.TripStatus
  }

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type TripStopListRelationFilter = {
    every?: TripStopWhereInput
    some?: TripStopWhereInput
    none?: TripStopWhereInput
  }

  export type TripStopOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TripCountOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    driverId?: SortOrder
    direction?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    lastLat?: SortOrder
    lastLng?: SortOrder
    lastSpeed?: SortOrder
    lastHeading?: SortOrder
    lastLocationAt?: SortOrder
    destName?: SortOrder
    destLat?: SortOrder
    destLng?: SortOrder
  }

  export type TripAvgOrderByAggregateInput = {
    lastLat?: SortOrder
    lastLng?: SortOrder
    lastSpeed?: SortOrder
    lastHeading?: SortOrder
    destLat?: SortOrder
    destLng?: SortOrder
  }

  export type TripMaxOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    driverId?: SortOrder
    direction?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    lastLat?: SortOrder
    lastLng?: SortOrder
    lastSpeed?: SortOrder
    lastHeading?: SortOrder
    lastLocationAt?: SortOrder
    destName?: SortOrder
    destLat?: SortOrder
    destLng?: SortOrder
  }

  export type TripMinOrderByAggregateInput = {
    id?: SortOrder
    busId?: SortOrder
    driverId?: SortOrder
    direction?: SortOrder
    status?: SortOrder
    startedAt?: SortOrder
    endedAt?: SortOrder
    lastLat?: SortOrder
    lastLng?: SortOrder
    lastSpeed?: SortOrder
    lastHeading?: SortOrder
    lastLocationAt?: SortOrder
    destName?: SortOrder
    destLat?: SortOrder
    destLng?: SortOrder
  }

  export type TripSumOrderByAggregateInput = {
    lastLat?: SortOrder
    lastLng?: SortOrder
    lastSpeed?: SortOrder
    lastHeading?: SortOrder
    destLat?: SortOrder
    destLng?: SortOrder
  }

  export type EnumTripStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TripStatus | EnumTripStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TripStatus[] | ListEnumTripStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripStatus[] | ListEnumTripStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTripStatusWithAggregatesFilter<$PrismaModel> | $Enums.TripStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTripStatusFilter<$PrismaModel>
    _max?: NestedEnumTripStatusFilter<$PrismaModel>
  }

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type EnumTripStopStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TripStopStatus | EnumTripStopStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TripStopStatus[] | ListEnumTripStopStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripStopStatus[] | ListEnumTripStopStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTripStopStatusFilter<$PrismaModel> | $Enums.TripStopStatus
  }

  export type TripRelationFilter = {
    is?: TripWhereInput
    isNot?: TripWhereInput
  }

  export type TripStopCountOrderByAggregateInput = {
    id?: SortOrder
    tripId?: SortOrder
    stopId?: SortOrder
    order?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    status?: SortOrder
    arrivedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type TripStopAvgOrderByAggregateInput = {
    order?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
  }

  export type TripStopMaxOrderByAggregateInput = {
    id?: SortOrder
    tripId?: SortOrder
    stopId?: SortOrder
    order?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    status?: SortOrder
    arrivedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type TripStopMinOrderByAggregateInput = {
    id?: SortOrder
    tripId?: SortOrder
    stopId?: SortOrder
    order?: SortOrder
    name?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
    status?: SortOrder
    arrivedAt?: SortOrder
    completedAt?: SortOrder
  }

  export type TripStopSumOrderByAggregateInput = {
    order?: SortOrder
    lat?: SortOrder
    lng?: SortOrder
  }

  export type EnumTripStopStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TripStopStatus | EnumTripStopStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TripStopStatus[] | ListEnumTripStopStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripStopStatus[] | ListEnumTripStopStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTripStopStatusWithAggregatesFilter<$PrismaModel> | $Enums.TripStopStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTripStopStatusFilter<$PrismaModel>
    _max?: NestedEnumTripStopStatusFilter<$PrismaModel>
  }

  export type NotificationLogTripIdTripStopIdStudentIdTypeCompoundUniqueInput = {
    tripId: string
    tripStopId: string
    studentId: string
    type: string
  }

  export type NotificationLogCountOrderByAggregateInput = {
    id?: SortOrder
    tripId?: SortOrder
    tripStopId?: SortOrder
    studentId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    etaSeconds?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationLogAvgOrderByAggregateInput = {
    etaSeconds?: SortOrder
  }

  export type NotificationLogMaxOrderByAggregateInput = {
    id?: SortOrder
    tripId?: SortOrder
    tripStopId?: SortOrder
    studentId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    etaSeconds?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationLogMinOrderByAggregateInput = {
    id?: SortOrder
    tripId?: SortOrder
    tripStopId?: SortOrder
    studentId?: SortOrder
    type?: SortOrder
    status?: SortOrder
    etaSeconds?: SortOrder
    sentAt?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationLogSumOrderByAggregateInput = {
    etaSeconds?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type EnumBusStatusFieldUpdateOperationsInput = {
    set?: $Enums.BusStatus
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type EnumTripDirectionFieldUpdateOperationsInput = {
    set?: $Enums.TripDirection
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type RouteStopCreateNestedManyWithoutRouteInput = {
    create?: XOR<RouteStopCreateWithoutRouteInput, RouteStopUncheckedCreateWithoutRouteInput> | RouteStopCreateWithoutRouteInput[] | RouteStopUncheckedCreateWithoutRouteInput[]
    connectOrCreate?: RouteStopCreateOrConnectWithoutRouteInput | RouteStopCreateOrConnectWithoutRouteInput[]
    createMany?: RouteStopCreateManyRouteInputEnvelope
    connect?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
  }

  export type RouteStopUncheckedCreateNestedManyWithoutRouteInput = {
    create?: XOR<RouteStopCreateWithoutRouteInput, RouteStopUncheckedCreateWithoutRouteInput> | RouteStopCreateWithoutRouteInput[] | RouteStopUncheckedCreateWithoutRouteInput[]
    connectOrCreate?: RouteStopCreateOrConnectWithoutRouteInput | RouteStopCreateOrConnectWithoutRouteInput[]
    createMany?: RouteStopCreateManyRouteInputEnvelope
    connect?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
  }

  export type RouteStopUpdateManyWithoutRouteNestedInput = {
    create?: XOR<RouteStopCreateWithoutRouteInput, RouteStopUncheckedCreateWithoutRouteInput> | RouteStopCreateWithoutRouteInput[] | RouteStopUncheckedCreateWithoutRouteInput[]
    connectOrCreate?: RouteStopCreateOrConnectWithoutRouteInput | RouteStopCreateOrConnectWithoutRouteInput[]
    upsert?: RouteStopUpsertWithWhereUniqueWithoutRouteInput | RouteStopUpsertWithWhereUniqueWithoutRouteInput[]
    createMany?: RouteStopCreateManyRouteInputEnvelope
    set?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
    disconnect?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
    delete?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
    connect?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
    update?: RouteStopUpdateWithWhereUniqueWithoutRouteInput | RouteStopUpdateWithWhereUniqueWithoutRouteInput[]
    updateMany?: RouteStopUpdateManyWithWhereWithoutRouteInput | RouteStopUpdateManyWithWhereWithoutRouteInput[]
    deleteMany?: RouteStopScalarWhereInput | RouteStopScalarWhereInput[]
  }

  export type RouteStopUncheckedUpdateManyWithoutRouteNestedInput = {
    create?: XOR<RouteStopCreateWithoutRouteInput, RouteStopUncheckedCreateWithoutRouteInput> | RouteStopCreateWithoutRouteInput[] | RouteStopUncheckedCreateWithoutRouteInput[]
    connectOrCreate?: RouteStopCreateOrConnectWithoutRouteInput | RouteStopCreateOrConnectWithoutRouteInput[]
    upsert?: RouteStopUpsertWithWhereUniqueWithoutRouteInput | RouteStopUpsertWithWhereUniqueWithoutRouteInput[]
    createMany?: RouteStopCreateManyRouteInputEnvelope
    set?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
    disconnect?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
    delete?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
    connect?: RouteStopWhereUniqueInput | RouteStopWhereUniqueInput[]
    update?: RouteStopUpdateWithWhereUniqueWithoutRouteInput | RouteStopUpdateWithWhereUniqueWithoutRouteInput[]
    updateMany?: RouteStopUpdateManyWithWhereWithoutRouteInput | RouteStopUpdateManyWithWhereWithoutRouteInput[]
    deleteMany?: RouteStopScalarWhereInput | RouteStopScalarWhereInput[]
  }

  export type RouteCreateNestedOneWithoutStopsInput = {
    create?: XOR<RouteCreateWithoutStopsInput, RouteUncheckedCreateWithoutStopsInput>
    connectOrCreate?: RouteCreateOrConnectWithoutStopsInput
    connect?: RouteWhereUniqueInput
  }

  export type RouteUpdateOneRequiredWithoutStopsNestedInput = {
    create?: XOR<RouteCreateWithoutStopsInput, RouteUncheckedCreateWithoutStopsInput>
    connectOrCreate?: RouteCreateOrConnectWithoutStopsInput
    upsert?: RouteUpsertWithoutStopsInput
    connect?: RouteWhereUniqueInput
    update?: XOR<XOR<RouteUpdateToOneWithWhereWithoutStopsInput, RouteUpdateWithoutStopsInput>, RouteUncheckedUpdateWithoutStopsInput>
  }

  export type TripStopCreateNestedManyWithoutTripInput = {
    create?: XOR<TripStopCreateWithoutTripInput, TripStopUncheckedCreateWithoutTripInput> | TripStopCreateWithoutTripInput[] | TripStopUncheckedCreateWithoutTripInput[]
    connectOrCreate?: TripStopCreateOrConnectWithoutTripInput | TripStopCreateOrConnectWithoutTripInput[]
    createMany?: TripStopCreateManyTripInputEnvelope
    connect?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
  }

  export type TripStopUncheckedCreateNestedManyWithoutTripInput = {
    create?: XOR<TripStopCreateWithoutTripInput, TripStopUncheckedCreateWithoutTripInput> | TripStopCreateWithoutTripInput[] | TripStopUncheckedCreateWithoutTripInput[]
    connectOrCreate?: TripStopCreateOrConnectWithoutTripInput | TripStopCreateOrConnectWithoutTripInput[]
    createMany?: TripStopCreateManyTripInputEnvelope
    connect?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
  }

  export type EnumTripStatusFieldUpdateOperationsInput = {
    set?: $Enums.TripStatus
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type TripStopUpdateManyWithoutTripNestedInput = {
    create?: XOR<TripStopCreateWithoutTripInput, TripStopUncheckedCreateWithoutTripInput> | TripStopCreateWithoutTripInput[] | TripStopUncheckedCreateWithoutTripInput[]
    connectOrCreate?: TripStopCreateOrConnectWithoutTripInput | TripStopCreateOrConnectWithoutTripInput[]
    upsert?: TripStopUpsertWithWhereUniqueWithoutTripInput | TripStopUpsertWithWhereUniqueWithoutTripInput[]
    createMany?: TripStopCreateManyTripInputEnvelope
    set?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
    disconnect?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
    delete?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
    connect?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
    update?: TripStopUpdateWithWhereUniqueWithoutTripInput | TripStopUpdateWithWhereUniqueWithoutTripInput[]
    updateMany?: TripStopUpdateManyWithWhereWithoutTripInput | TripStopUpdateManyWithWhereWithoutTripInput[]
    deleteMany?: TripStopScalarWhereInput | TripStopScalarWhereInput[]
  }

  export type TripStopUncheckedUpdateManyWithoutTripNestedInput = {
    create?: XOR<TripStopCreateWithoutTripInput, TripStopUncheckedCreateWithoutTripInput> | TripStopCreateWithoutTripInput[] | TripStopUncheckedCreateWithoutTripInput[]
    connectOrCreate?: TripStopCreateOrConnectWithoutTripInput | TripStopCreateOrConnectWithoutTripInput[]
    upsert?: TripStopUpsertWithWhereUniqueWithoutTripInput | TripStopUpsertWithWhereUniqueWithoutTripInput[]
    createMany?: TripStopCreateManyTripInputEnvelope
    set?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
    disconnect?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
    delete?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
    connect?: TripStopWhereUniqueInput | TripStopWhereUniqueInput[]
    update?: TripStopUpdateWithWhereUniqueWithoutTripInput | TripStopUpdateWithWhereUniqueWithoutTripInput[]
    updateMany?: TripStopUpdateManyWithWhereWithoutTripInput | TripStopUpdateManyWithWhereWithoutTripInput[]
    deleteMany?: TripStopScalarWhereInput | TripStopScalarWhereInput[]
  }

  export type TripCreateNestedOneWithoutStopsInput = {
    create?: XOR<TripCreateWithoutStopsInput, TripUncheckedCreateWithoutStopsInput>
    connectOrCreate?: TripCreateOrConnectWithoutStopsInput
    connect?: TripWhereUniqueInput
  }

  export type EnumTripStopStatusFieldUpdateOperationsInput = {
    set?: $Enums.TripStopStatus
  }

  export type TripUpdateOneRequiredWithoutStopsNestedInput = {
    create?: XOR<TripCreateWithoutStopsInput, TripUncheckedCreateWithoutStopsInput>
    connectOrCreate?: TripCreateOrConnectWithoutStopsInput
    upsert?: TripUpsertWithoutStopsInput
    connect?: TripWhereUniqueInput
    update?: XOR<XOR<TripUpdateToOneWithWhereWithoutStopsInput, TripUpdateWithoutStopsInput>, TripUncheckedUpdateWithoutStopsInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumBusStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.BusStatus | EnumBusStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BusStatus[] | ListEnumBusStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BusStatus[] | ListEnumBusStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBusStatusFilter<$PrismaModel> | $Enums.BusStatus
  }

  export type NestedEnumBusStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.BusStatus | EnumBusStatusFieldRefInput<$PrismaModel>
    in?: $Enums.BusStatus[] | ListEnumBusStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.BusStatus[] | ListEnumBusStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumBusStatusWithAggregatesFilter<$PrismaModel> | $Enums.BusStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumBusStatusFilter<$PrismaModel>
    _max?: NestedEnumBusStatusFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedEnumTripDirectionFilter<$PrismaModel = never> = {
    equals?: $Enums.TripDirection | EnumTripDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.TripDirection[] | ListEnumTripDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripDirection[] | ListEnumTripDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumTripDirectionFilter<$PrismaModel> | $Enums.TripDirection
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type NestedEnumTripDirectionWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TripDirection | EnumTripDirectionFieldRefInput<$PrismaModel>
    in?: $Enums.TripDirection[] | ListEnumTripDirectionFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripDirection[] | ListEnumTripDirectionFieldRefInput<$PrismaModel>
    not?: NestedEnumTripDirectionWithAggregatesFilter<$PrismaModel> | $Enums.TripDirection
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTripDirectionFilter<$PrismaModel>
    _max?: NestedEnumTripDirectionFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumTripStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TripStatus | EnumTripStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TripStatus[] | ListEnumTripStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripStatus[] | ListEnumTripStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTripStatusFilter<$PrismaModel> | $Enums.TripStatus
  }

  export type NestedEnumTripStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TripStatus | EnumTripStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TripStatus[] | ListEnumTripStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripStatus[] | ListEnumTripStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTripStatusWithAggregatesFilter<$PrismaModel> | $Enums.TripStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTripStatusFilter<$PrismaModel>
    _max?: NestedEnumTripStatusFilter<$PrismaModel>
  }

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
  }

  export type NestedEnumTripStopStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.TripStopStatus | EnumTripStopStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TripStopStatus[] | ListEnumTripStopStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripStopStatus[] | ListEnumTripStopStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTripStopStatusFilter<$PrismaModel> | $Enums.TripStopStatus
  }

  export type NestedEnumTripStopStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.TripStopStatus | EnumTripStopStatusFieldRefInput<$PrismaModel>
    in?: $Enums.TripStopStatus[] | ListEnumTripStopStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.TripStopStatus[] | ListEnumTripStopStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumTripStopStatusWithAggregatesFilter<$PrismaModel> | $Enums.TripStopStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumTripStopStatusFilter<$PrismaModel>
    _max?: NestedEnumTripStopStatusFilter<$PrismaModel>
  }

  export type RouteStopCreateWithoutRouteInput = {
    id?: string
    name: string
    lat: number
    lng: number
    order: number
    distanceFromStart?: number
    estimatedTime?: number
    createdAt?: Date | string
  }

  export type RouteStopUncheckedCreateWithoutRouteInput = {
    id?: string
    name: string
    lat: number
    lng: number
    order: number
    distanceFromStart?: number
    estimatedTime?: number
    createdAt?: Date | string
  }

  export type RouteStopCreateOrConnectWithoutRouteInput = {
    where: RouteStopWhereUniqueInput
    create: XOR<RouteStopCreateWithoutRouteInput, RouteStopUncheckedCreateWithoutRouteInput>
  }

  export type RouteStopCreateManyRouteInputEnvelope = {
    data: RouteStopCreateManyRouteInput | RouteStopCreateManyRouteInput[]
    skipDuplicates?: boolean
  }

  export type RouteStopUpsertWithWhereUniqueWithoutRouteInput = {
    where: RouteStopWhereUniqueInput
    update: XOR<RouteStopUpdateWithoutRouteInput, RouteStopUncheckedUpdateWithoutRouteInput>
    create: XOR<RouteStopCreateWithoutRouteInput, RouteStopUncheckedCreateWithoutRouteInput>
  }

  export type RouteStopUpdateWithWhereUniqueWithoutRouteInput = {
    where: RouteStopWhereUniqueInput
    data: XOR<RouteStopUpdateWithoutRouteInput, RouteStopUncheckedUpdateWithoutRouteInput>
  }

  export type RouteStopUpdateManyWithWhereWithoutRouteInput = {
    where: RouteStopScalarWhereInput
    data: XOR<RouteStopUpdateManyMutationInput, RouteStopUncheckedUpdateManyWithoutRouteInput>
  }

  export type RouteStopScalarWhereInput = {
    AND?: RouteStopScalarWhereInput | RouteStopScalarWhereInput[]
    OR?: RouteStopScalarWhereInput[]
    NOT?: RouteStopScalarWhereInput | RouteStopScalarWhereInput[]
    id?: StringFilter<"RouteStop"> | string
    routeId?: StringFilter<"RouteStop"> | string
    name?: StringFilter<"RouteStop"> | string
    lat?: FloatFilter<"RouteStop"> | number
    lng?: FloatFilter<"RouteStop"> | number
    order?: IntFilter<"RouteStop"> | number
    distanceFromStart?: FloatFilter<"RouteStop"> | number
    estimatedTime?: IntFilter<"RouteStop"> | number
    createdAt?: DateTimeFilter<"RouteStop"> | Date | string
  }

  export type RouteCreateWithoutStopsInput = {
    id?: string
    name: string
    busId: string
    startPoint: string
    endPoint?: string | null
    createdAt?: Date | string
  }

  export type RouteUncheckedCreateWithoutStopsInput = {
    id?: string
    name: string
    busId: string
    startPoint: string
    endPoint?: string | null
    createdAt?: Date | string
  }

  export type RouteCreateOrConnectWithoutStopsInput = {
    where: RouteWhereUniqueInput
    create: XOR<RouteCreateWithoutStopsInput, RouteUncheckedCreateWithoutStopsInput>
  }

  export type RouteUpsertWithoutStopsInput = {
    update: XOR<RouteUpdateWithoutStopsInput, RouteUncheckedUpdateWithoutStopsInput>
    create: XOR<RouteCreateWithoutStopsInput, RouteUncheckedCreateWithoutStopsInput>
    where?: RouteWhereInput
  }

  export type RouteUpdateToOneWithWhereWithoutStopsInput = {
    where?: RouteWhereInput
    data: XOR<RouteUpdateWithoutStopsInput, RouteUncheckedUpdateWithoutStopsInput>
  }

  export type RouteUpdateWithoutStopsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    startPoint?: StringFieldUpdateOperationsInput | string
    endPoint?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteUncheckedUpdateWithoutStopsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    startPoint?: StringFieldUpdateOperationsInput | string
    endPoint?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TripStopCreateWithoutTripInput = {
    id?: string
    stopId: string
    order: number
    name: string
    lat: number
    lng: number
    status?: $Enums.TripStopStatus
    arrivedAt?: Date | string | null
    completedAt?: Date | string | null
  }

  export type TripStopUncheckedCreateWithoutTripInput = {
    id?: string
    stopId: string
    order: number
    name: string
    lat: number
    lng: number
    status?: $Enums.TripStopStatus
    arrivedAt?: Date | string | null
    completedAt?: Date | string | null
  }

  export type TripStopCreateOrConnectWithoutTripInput = {
    where: TripStopWhereUniqueInput
    create: XOR<TripStopCreateWithoutTripInput, TripStopUncheckedCreateWithoutTripInput>
  }

  export type TripStopCreateManyTripInputEnvelope = {
    data: TripStopCreateManyTripInput | TripStopCreateManyTripInput[]
    skipDuplicates?: boolean
  }

  export type TripStopUpsertWithWhereUniqueWithoutTripInput = {
    where: TripStopWhereUniqueInput
    update: XOR<TripStopUpdateWithoutTripInput, TripStopUncheckedUpdateWithoutTripInput>
    create: XOR<TripStopCreateWithoutTripInput, TripStopUncheckedCreateWithoutTripInput>
  }

  export type TripStopUpdateWithWhereUniqueWithoutTripInput = {
    where: TripStopWhereUniqueInput
    data: XOR<TripStopUpdateWithoutTripInput, TripStopUncheckedUpdateWithoutTripInput>
  }

  export type TripStopUpdateManyWithWhereWithoutTripInput = {
    where: TripStopScalarWhereInput
    data: XOR<TripStopUpdateManyMutationInput, TripStopUncheckedUpdateManyWithoutTripInput>
  }

  export type TripStopScalarWhereInput = {
    AND?: TripStopScalarWhereInput | TripStopScalarWhereInput[]
    OR?: TripStopScalarWhereInput[]
    NOT?: TripStopScalarWhereInput | TripStopScalarWhereInput[]
    id?: StringFilter<"TripStop"> | string
    tripId?: StringFilter<"TripStop"> | string
    stopId?: StringFilter<"TripStop"> | string
    order?: IntFilter<"TripStop"> | number
    name?: StringFilter<"TripStop"> | string
    lat?: FloatFilter<"TripStop"> | number
    lng?: FloatFilter<"TripStop"> | number
    status?: EnumTripStopStatusFilter<"TripStop"> | $Enums.TripStopStatus
    arrivedAt?: DateTimeNullableFilter<"TripStop"> | Date | string | null
    completedAt?: DateTimeNullableFilter<"TripStop"> | Date | string | null
  }

  export type TripCreateWithoutStopsInput = {
    id?: string
    busId: string
    driverId: string
    direction: $Enums.TripDirection
    status?: $Enums.TripStatus
    startedAt?: Date | string
    endedAt?: Date | string | null
    lastLat?: number | null
    lastLng?: number | null
    lastSpeed?: number | null
    lastHeading?: number | null
    lastLocationAt?: Date | string | null
    destName?: string | null
    destLat?: number | null
    destLng?: number | null
  }

  export type TripUncheckedCreateWithoutStopsInput = {
    id?: string
    busId: string
    driverId: string
    direction: $Enums.TripDirection
    status?: $Enums.TripStatus
    startedAt?: Date | string
    endedAt?: Date | string | null
    lastLat?: number | null
    lastLng?: number | null
    lastSpeed?: number | null
    lastHeading?: number | null
    lastLocationAt?: Date | string | null
    destName?: string | null
    destLat?: number | null
    destLng?: number | null
  }

  export type TripCreateOrConnectWithoutStopsInput = {
    where: TripWhereUniqueInput
    create: XOR<TripCreateWithoutStopsInput, TripUncheckedCreateWithoutStopsInput>
  }

  export type TripUpsertWithoutStopsInput = {
    update: XOR<TripUpdateWithoutStopsInput, TripUncheckedUpdateWithoutStopsInput>
    create: XOR<TripCreateWithoutStopsInput, TripUncheckedCreateWithoutStopsInput>
    where?: TripWhereInput
  }

  export type TripUpdateToOneWithWhereWithoutStopsInput = {
    where?: TripWhereInput
    data: XOR<TripUpdateWithoutStopsInput, TripUncheckedUpdateWithoutStopsInput>
  }

  export type TripUpdateWithoutStopsInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    status?: EnumTripStatusFieldUpdateOperationsInput | $Enums.TripStatus
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLat?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLng?: NullableFloatFieldUpdateOperationsInput | number | null
    lastSpeed?: NullableFloatFieldUpdateOperationsInput | number | null
    lastHeading?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLocationAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destName?: NullableStringFieldUpdateOperationsInput | string | null
    destLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destLng?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type TripUncheckedUpdateWithoutStopsInput = {
    id?: StringFieldUpdateOperationsInput | string
    busId?: StringFieldUpdateOperationsInput | string
    driverId?: StringFieldUpdateOperationsInput | string
    direction?: EnumTripDirectionFieldUpdateOperationsInput | $Enums.TripDirection
    status?: EnumTripStatusFieldUpdateOperationsInput | $Enums.TripStatus
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLat?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLng?: NullableFloatFieldUpdateOperationsInput | number | null
    lastSpeed?: NullableFloatFieldUpdateOperationsInput | number | null
    lastHeading?: NullableFloatFieldUpdateOperationsInput | number | null
    lastLocationAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    destName?: NullableStringFieldUpdateOperationsInput | string | null
    destLat?: NullableFloatFieldUpdateOperationsInput | number | null
    destLng?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type RouteStopCreateManyRouteInput = {
    id?: string
    name: string
    lat: number
    lng: number
    order: number
    distanceFromStart?: number
    estimatedTime?: number
    createdAt?: Date | string
  }

  export type RouteStopUpdateWithoutRouteInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    distanceFromStart?: FloatFieldUpdateOperationsInput | number
    estimatedTime?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteStopUncheckedUpdateWithoutRouteInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    distanceFromStart?: FloatFieldUpdateOperationsInput | number
    estimatedTime?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type RouteStopUncheckedUpdateManyWithoutRouteInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    order?: IntFieldUpdateOperationsInput | number
    distanceFromStart?: FloatFieldUpdateOperationsInput | number
    estimatedTime?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TripStopCreateManyTripInput = {
    id?: string
    stopId: string
    order: number
    name: string
    lat: number
    lng: number
    status?: $Enums.TripStopStatus
    arrivedAt?: Date | string | null
    completedAt?: Date | string | null
  }

  export type TripStopUpdateWithoutTripInput = {
    id?: StringFieldUpdateOperationsInput | string
    stopId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    status?: EnumTripStopStatusFieldUpdateOperationsInput | $Enums.TripStopStatus
    arrivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TripStopUncheckedUpdateWithoutTripInput = {
    id?: StringFieldUpdateOperationsInput | string
    stopId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    status?: EnumTripStopStatusFieldUpdateOperationsInput | $Enums.TripStopStatus
    arrivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type TripStopUncheckedUpdateManyWithoutTripInput = {
    id?: StringFieldUpdateOperationsInput | string
    stopId?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    lat?: FloatFieldUpdateOperationsInput | number
    lng?: FloatFieldUpdateOperationsInput | number
    status?: EnumTripStopStatusFieldUpdateOperationsInput | $Enums.TripStopStatus
    arrivedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use RouteCountOutputTypeDefaultArgs instead
     */
    export type RouteCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RouteCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TripCountOutputTypeDefaultArgs instead
     */
    export type TripCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TripCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use UserDefaultArgs instead
     */
    export type UserArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = UserDefaultArgs<ExtArgs>
    /**
     * @deprecated Use BusDefaultArgs instead
     */
    export type BusArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = BusDefaultArgs<ExtArgs>
    /**
     * @deprecated Use LiveLocationDefaultArgs instead
     */
    export type LiveLocationArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = LiveLocationDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StopDefaultArgs instead
     */
    export type StopArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StopDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SchoolDefaultArgs instead
     */
    export type SchoolArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SchoolDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AdminDefaultArgs instead
     */
    export type AdminArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AdminDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AttendanceDefaultArgs instead
     */
    export type AttendanceArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AttendanceDefaultArgs<ExtArgs>
    /**
     * @deprecated Use DriverDefaultArgs instead
     */
    export type DriverArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = DriverDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ConductorDefaultArgs instead
     */
    export type ConductorArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ConductorDefaultArgs<ExtArgs>
    /**
     * @deprecated Use EmergencyDefaultArgs instead
     */
    export type EmergencyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = EmergencyDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StudentDefaultArgs instead
     */
    export type StudentArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StudentDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RouteDefaultArgs instead
     */
    export type RouteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RouteDefaultArgs<ExtArgs>
    /**
     * @deprecated Use RouteStopDefaultArgs instead
     */
    export type RouteStopArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = RouteStopDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TripDefaultArgs instead
     */
    export type TripArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TripDefaultArgs<ExtArgs>
    /**
     * @deprecated Use TripStopDefaultArgs instead
     */
    export type TripStopArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = TripStopDefaultArgs<ExtArgs>
    /**
     * @deprecated Use NotificationLogDefaultArgs instead
     */
    export type NotificationLogArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = NotificationLogDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}