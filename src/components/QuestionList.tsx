import React, { useState } from 'react';
import { List, ListItem, ListItemText, Button, TextField } from '@mui/material';
import "../styles/question-list.scss"; 

interface QuestionListProps {
  questions: any[];
  onAddQuestion: () => void;
  onSelectQuestion: (question: any) => void;
  selectedQuestion: any | null;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onAddQuestion,
  onSelectQuestion,
  selectedQuestion
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredQuestions = questions.filter((question) =>
    question.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="question-list-container">
      <TextField
        className='search'
        label="Search question"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <Button variant="contained" onClick={onAddQuestion}>
        Add Question
      </Button>
      <div className="list-container">
        <List>
          {filteredQuestions.map((question) => (
            <ListItem
              key={question.id}
              button
              onClick={() => onSelectQuestion(question)}
              className={selectedQuestion && selectedQuestion.id === question.id ? 'active-question' : ''}
            >
              <ListItemText primary={question.text} />
            </ListItem>
          ))}
        </List>
      </div>
    </div>
  );
};

export default QuestionList;
