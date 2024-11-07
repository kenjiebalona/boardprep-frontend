export interface Objective {
    text: string;
  }
  
  export interface Subtopic {
    subtopic_id: string;
    subtopic_title: string;
    order: number;
  }
  
  export interface Topic {
    topic_id: string;
    topic_title: string;
    order: number;
    subtopics: Subtopic[];
    learning_objectives: Objective[];
  }
  
  export interface Lesson {
    lesson_id: string;
    lesson_title: string;
    order: number;
    syllabus: string;
    completed: boolean;
    quiz_id: string;
    topics: Topic[];
    learning_objectives: Objective[];
  }
  