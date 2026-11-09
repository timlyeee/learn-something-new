export interface ScriptedExerciseGenerator<TRequest, TResult> {
  readonly id: string;
  generate(request: TRequest): TResult;
}
