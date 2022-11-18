import { Sequence, Step } from '../definition';

export class SequenceModifier {
	public static moveStep(sourceSequence: Sequence, step: Step, targetSequence: Sequence, targetIndex: number) {
		const sourceIndex = sourceSequence.indexOf(step);
		if (sourceIndex < 0) {
			throw new Error('Unknown step');
		}

		const isSameSequence = sourceSequence === targetSequence;
		if (isSameSequence && sourceIndex === targetIndex) {
			return; // Nothing to do.
		}

		sourceSequence.splice(sourceIndex, 1);
		if (isSameSequence && sourceIndex < targetIndex) {
			targetIndex--;
		}
		targetSequence.splice(targetIndex, 0, step);
	}

	public static insertStep(step: Step, targetSequence: Sequence, targetIndex: number) {
		targetSequence.splice(targetIndex, 0, step);
	}

	public static deleteStep(step: Step, parentSequence: Sequence, choice: string) {
		if (choice == "0" && step.branches.False.length > 0){
			console.log("delete true");
			for (let i = 0; i < step.branches.False.length; i++) {
				parentSequence.push(step.branches.False[i]);
			}
		} 
		// If deleting false branch, keep blocks in true
		else if (choice == "1" && step.branches.True.length > 0) {
			console.log("delete false");
			for (let i = 0; i < step.branches.True.length; i++) {
				parentSequence.push(step.branches.True[i]);
			}
		} 
		
		if (choice != null) {
			const index = parentSequence.indexOf(step);
			if (index < 0) {
				throw new Error('Unknown step');
			}
			parentSequence.splice(index, 1);
		}
	}
}
