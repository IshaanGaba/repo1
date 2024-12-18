// AnswerSheetTab.js
import React from 'react';
import { Card } from 'primereact/card';
import { Image } from 'primereact/image';

const AnswerSheetTab = ({ photoUrl }) => {
  return (
    <Card>
      {photoUrl ? (
        <Image src={photoUrl} alt="Answer Sheet" width="100%" preview />
      ) : (
        <p>No answer sheet available</p>
      )}
    </Card>
  );
};

export default AnswerSheetTab;
