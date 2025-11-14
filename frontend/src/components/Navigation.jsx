import React from 'react';

export default function Navigation({ step, totalSteps }) {
  return (
    <footer className="footer">
      <p className="footer-text">
        Step {step} of {totalSteps} | Sprint Kit - Plan your project. Learn real skills.
      </p>
    </footer>
  );
}
