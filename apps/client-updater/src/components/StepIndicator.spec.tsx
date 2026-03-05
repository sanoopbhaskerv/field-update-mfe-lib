import { render, screen } from '@testing-library/react';
import { StepIndicator } from './StepIndicator';

describe('StepIndicator', () => {
    it('should render all three steps', () => {
        render(<StepIndicator currentStep={1} />);
        expect(screen.getByText('Edit')).toBeTruthy();
        expect(screen.getByText('Verify')).toBeTruthy();
        expect(screen.getByText('Done')).toBeTruthy();
    });

    it('should mark past steps as completed', () => {
        const { container } = render(<StepIndicator currentStep={3} />);
        // 1 and 2 should have ✓ instead of numbers
        const checkmarks = screen.getAllByText('✓');
        expect(checkmarks.length).toBe(2);

        // 3 should still be a number
        expect(screen.getByText('3')).toBeTruthy();
    });

    it('should indicate current active step for accessibility', () => {
        const { container } = render(<StepIndicator currentStep={2} />);

        // Find the element with aria-current="step"
        const activeStep = container.querySelector('[aria-current="step"]');
        expect(activeStep).toBeTruthy();

        // It should contain the text for step 2
        expect(activeStep?.textContent).toContain('Verify');
    });
});
