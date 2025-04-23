export interface SCORMDataModel {
  // Core data elements
  "cmi.core.student_id"?: string; // Identifies the learner
  "cmi.core.student_name"?: string; // Learner's name
  "cmi.core.lesson_location"?: string; // Learner's current location in the SCO
  "cmi.core.lesson_status"?:
    | "passed"
    | "completed"
    | "failed"
    | "incomplete"
    | "browsed"
    | "not attempted"; // Status of the lesson
  "cmi.core.score.raw"?: number; // Raw score achieved by the learner
  "cmi.core.score.max"?: number; // Maximum possible score
  "cmi.core.score.min"?: number; // Minimum possible score
  "cmi.core.total_time"?: string; // Total time spent in the SCO
  "cmi.core.exit"?: "time-out" | "suspend" | "logout" | ""; // How the learner exited the SCO
  "cmi.core.session_time"?: string; // Time spent in the current session

  // Suspend data
  "cmi.suspend_data"?: string; // Data persisted across sessions

  // Launch data
  "cmi.launch_data"?: string; // Data provided by the LMS at launch

  // Interactions (simplified example)
  "cmi.interactions._count"?: number; // Number of interactions
  "cmi.interactions.n.id"?: string; // Interaction identifier
  "cmi.interactions.n.type"?: string; // Type of interaction
  "cmi.interactions.n.timestamp"?: string; // Timestamp of interaction
  "cmi.interactions.n.correct_responses._count"?: number; // Number of correct responses
  "cmi.interactions.n.correct_responses.n.pattern"?: string; // Correct response pattern
  "cmi.interactions.n.weighting"?: number; // Weighting of interaction
  "cmi.interactions.n.learner_response"?: string; // Learner's response
  "cmi.interactions.n.result"?: string; // Result of interaction
  "cmi.interactions.n.latency"?: string; // Time to respond
  "cmi.interactions.n.description"?: string; // Description of interaction

  // Objectives (simplified example)
  "cmi.objectives._count"?: number; // Number of objectives
  "cmi.objectives.n.id"?: string; // Objective identifier
  "cmi.objectives.n.score.raw"?: number; // Raw score for objective
  "cmi.objectives.n.score.max"?: number; // Maximum score for objective
  "cmi.objectives.n.score.min"?: number; // Minimum score for objective
  "cmi.objectives.n.status"?:
    | "passed"
    | "failed"
    | "completed"
    | "incomplete"
    | "not attempted"
    | "browsed"; // Status of objective
}
