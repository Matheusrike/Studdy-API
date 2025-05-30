
/* !!! This is code generated by Prisma. Do not edit directly. !!!
/* eslint-disable */

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
 * Prisma Client JS version: 6.8.2
 * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
 */
Prisma.prismaVersion = {
  client: "6.8.2",
  engine: "2060c79ba17c6bb9f5823312b6f6b7f4a845738e"
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
  name: 'name',
  email: 'email',
  birth_date: 'birth_date',
  cpf: 'cpf',
  created_at: 'created_at',
  modified_at: 'modified_at',
  role: 'role',
  hashed_password: 'hashed_password'
};

exports.Prisma.TeacherScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  created_at: 'created_at',
  modified_at: 'modified_at'
};

exports.Prisma.SubjectScalarFieldEnum = {
  id: 'id',
  name: 'name',
  created_at: 'created_at',
  modified_at: 'modified_at'
};

exports.Prisma.Relationship_teacher_subjectScalarFieldEnum = {
  id: 'id',
  subject_id: 'subject_id',
  teacher_id: 'teacher_id'
};

exports.Prisma.ClassScalarFieldEnum = {
  id: 'id',
  name: 'name',
  shift: 'shift',
  course: 'course',
  created_at: 'created_at',
  modified_at: 'modified_at'
};

exports.Prisma.StudentScalarFieldEnum = {
  id: 'id',
  enrollment: 'enrollment',
  user_id: 'user_id',
  class_id: 'class_id',
  created_at: 'created_at',
  modified_at: 'modified_at'
};

exports.Prisma.Relationship_teacher_subject_classScalarFieldEnum = {
  id: 'id',
  class_id: 'class_id',
  teacher_subject_id: 'teacher_subject_id'
};

exports.Prisma.QuizScalarFieldEnum = {
  id: 'id',
  title: 'title',
  duration_minutes: 'duration_minutes',
  max_points: 'max_points',
  max_attempt: 'max_attempt',
  visibility: 'visibility',
  created_at: 'created_at',
  modified_at: 'modified_at',
  teacher_subject_class_id: 'teacher_subject_class_id'
};

exports.Prisma.QuestionScalarFieldEnum = {
  id: 'id',
  statement: 'statement',
  points: 'points',
  quiz_id: 'quiz_id',
  created_at: 'created_at',
  modified_at: 'modified_at'
};

exports.Prisma.AlternativeScalarFieldEnum = {
  id: 'id',
  question_id: 'question_id',
  response: 'response',
  correct_alternative: 'correct_alternative',
  created_at: 'created_at',
  modified_at: 'modified_at'
};

exports.Prisma.Question_imagesScalarFieldEnum = {
  id: 'id',
  image_path: 'image_path',
  alt_text: 'alt_text',
  question_id: 'question_id',
  created_at: 'created_at'
};

exports.Prisma.Quiz_attemptScalarFieldEnum = {
  id: 'id',
  student_id: 'student_id',
  quiz_id: 'quiz_id',
  started_at: 'started_at',
  finished_at: 'finished_at',
  status: 'status',
  total_score: 'total_score',
  created_at: 'created_at',
  modified_at: 'modified_at'
};

exports.Prisma.Question_responseScalarFieldEnum = {
  id: 'id',
  question_id: 'question_id',
  marked_alternative_id: 'marked_alternative_id',
  quiz_attempt_id: 'quiz_attempt_id',
  is_correct: 'is_correct',
  points_earned: 'points_earned',
  created_at: 'created_at',
  modified_at: 'modified_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.UserOrderByRelevanceFieldEnum = {
  name: 'name',
  email: 'email',
  cpf: 'cpf',
  hashed_password: 'hashed_password'
};

exports.Prisma.SubjectOrderByRelevanceFieldEnum = {
  name: 'name'
};

exports.Prisma.ClassOrderByRelevanceFieldEnum = {
  name: 'name',
  course: 'course'
};

exports.Prisma.StudentOrderByRelevanceFieldEnum = {
  enrollment: 'enrollment'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.QuizOrderByRelevanceFieldEnum = {
  title: 'title'
};

exports.Prisma.QuestionOrderByRelevanceFieldEnum = {
  statement: 'statement'
};

exports.Prisma.AlternativeOrderByRelevanceFieldEnum = {
  response: 'response'
};

exports.Prisma.Question_imagesOrderByRelevanceFieldEnum = {
  image_path: 'image_path',
  alt_text: 'alt_text'
};
exports.Role = exports.$Enums.Role = {
  Admin: 'Admin',
  Student: 'Student',
  Teacher: 'Teacher'
};

exports.Shift = exports.$Enums.Shift = {
  Morning: 'Morning',
  Afternoon: 'Afternoon',
  Evening: 'Evening',
  Full: 'Full'
};

exports.QuizVisibility = exports.$Enums.QuizVisibility = {
  draft: 'draft',
  public: 'public',
  archived: 'archived'
};

exports.AttemptStatus = exports.$Enums.AttemptStatus = {
  in_progress: 'in_progress',
  completed: 'completed',
  abandoned: 'abandoned'
};

exports.Prisma.ModelName = {
  User: 'User',
  Teacher: 'Teacher',
  Subject: 'Subject',
  Relationship_teacher_subject: 'Relationship_teacher_subject',
  Class: 'Class',
  Student: 'Student',
  Relationship_teacher_subject_class: 'Relationship_teacher_subject_class',
  Quiz: 'Quiz',
  Question: 'Question',
  Alternative: 'Alternative',
  Question_images: 'Question_images',
  Quiz_attempt: 'Quiz_attempt',
  Question_response: 'Question_response'
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
