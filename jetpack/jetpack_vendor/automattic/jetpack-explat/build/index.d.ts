/**
 * External dependencies
 */
import { createExPlatClient } from '@automattic/explat-client';
import debugFactory from 'debug';
export { createExPlatClient };
export declare const initializeExPlat: () => Promise<string | null | void>;
export declare const loadExperimentAssignment: (experimentName: string) => Promise<import("@automattic/explat-client").ExperimentAssignment>, dangerouslyGetExperimentAssignment: (experimentName: string) => import("@automattic/explat-client").ExperimentAssignment;
export declare const useExperiment: (experimentName: string, options?: import("@automattic/explat-client-react-helpers").ExperimentOptions) => [boolean, import("@automattic/explat-client").ExperimentAssignment | null], Experiment: (props: {
    name: string;
    defaultExperience: debugFactory;
    treatmentExperience: debugFactory;
    loadingExperience: debugFactory;
    options?: import("@automattic/explat-client-react-helpers").ExperimentOptions;
}) => JSX.Element, ProvideExperimentData: (props: {
    children: (isLoading: boolean, experimentAssignment: import("@automattic/explat-client").ExperimentAssignment | null) => JSX.Element;
    name: string;
    options?: import("@automattic/explat-client-react-helpers").ExperimentOptions;
}) => JSX.Element;
export declare const loadExperimentAssignmentWithAuth: (experimentName: string) => Promise<import("@automattic/explat-client").ExperimentAssignment>, dangerouslyGetExperimentAssignmentWithAuth: (experimentName: string) => import("@automattic/explat-client").ExperimentAssignment;
export declare const useExperimentWithAuth: (experimentName: string, options?: import("@automattic/explat-client-react-helpers").ExperimentOptions) => [boolean, import("@automattic/explat-client").ExperimentAssignment | null], ExperimentWithAuth: (props: {
    name: string;
    defaultExperience: debugFactory;
    treatmentExperience: debugFactory;
    loadingExperience: debugFactory;
    options?: import("@automattic/explat-client-react-helpers").ExperimentOptions;
}) => JSX.Element, ProvideExperimentDataWithAuth: (props: {
    children: (isLoading: boolean, experimentAssignment: import("@automattic/explat-client").ExperimentAssignment | null) => JSX.Element;
    name: string;
    options?: import("@automattic/explat-client-react-helpers").ExperimentOptions;
}) => JSX.Element;
