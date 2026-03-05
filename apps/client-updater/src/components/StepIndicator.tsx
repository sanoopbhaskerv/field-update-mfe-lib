import React from 'react';
import styles from './StepIndicator.module.css';

interface StepIndicatorProps {
    currentStep: 1 | 2 | 3;
}

const STEPS = [
    { num: 1, label: 'Edit' },
    { num: 2, label: 'Verify' },
    { num: 3, label: 'Done' },
];

export function StepIndicator({ currentStep }: StepIndicatorProps) {
    return (
        <div className={styles.container} role="navigation" aria-label="Wizard steps">
            {STEPS.map((step, idx) => (
                <React.Fragment key={step.num}>
                    <div
                        className={`${styles.step} ${step.num < currentStep
                                ? styles.completed
                                : step.num === currentStep
                                    ? styles.active
                                    : styles.upcoming
                            }`}
                        aria-current={step.num === currentStep ? 'step' : undefined}
                    >
                        <div className={styles.circle}>
                            {step.num < currentStep ? '✓' : step.num}
                        </div>
                        <span className={styles.label}>{step.label}</span>
                    </div>
                    {idx < STEPS.length - 1 && (
                        <div
                            className={`${styles.connector} ${step.num < currentStep ? styles.connectorCompleted : ''
                                }`}
                        />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}
