// @vitest-environment jsdom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { FRONT_COMPONENT_CONTEXT_KEY } from '@/sdk/front-component/constants/front-component-context-key';
import { FRONT_COMPONENT_LISTENERS_KEY } from '@/sdk/front-component/constants/front-component-listeners-key';
import { useFrontComponentExecutionContext } from '@/sdk/front-component/hooks/useFrontComponentExecutionContext';
import { type FrontComponentExecutionContext } from '@/sdk/front-component/types/FrontComponentExecutionContext';

// Stops a render loop so the test fails instead of hanging.
const MAX_RENDERS = 50;

const EXECUTION_CONTEXT: FrontComponentExecutionContext = {
  frontComponentId: 'front-component-id',
  userId: 'user-id',
  recordId: 'record-id',
  selectedRecordIds: ['record-id'],
  timelineActivityId: null,
  colorScheme: 'light',
};

const globalScope = globalThis as Record<string, unknown>;

const setExecutionContext = (context: FrontComponentExecutionContext) => {
  globalScope[FRONT_COMPONENT_CONTEXT_KEY] = context;

  const listeners = globalScope[FRONT_COMPONENT_LISTENERS_KEY] as
    | Set<() => void>
    | undefined;

  listeners?.forEach((listener) => listener());
};

type SelectedFields = {
  recordId: string | null;
  selectedRecordIds: string[];
};

let container: HTMLDivElement;
let root: Root;
let renderCount: number;
let lastSelectedFields: SelectedFields | undefined;

const ObjectSelectorReader = () => {
  renderCount += 1;

  if (renderCount > MAX_RENDERS) {
    throw new Error(`Rendered more than ${MAX_RENDERS} times`);
  }

  lastSelectedFields = useFrontComponentExecutionContext((context) => ({
    recordId: context.recordId,
    selectedRecordIds: context.selectedRecordIds,
  }));

  return null;
};

beforeEach(() => {
  (
    globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  globalScope[FRONT_COMPONENT_CONTEXT_KEY] = EXECUTION_CONTEXT;
  renderCount = 0;
  lastSelectedFields = undefined;
  container = document.createElement('div');
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  delete globalScope[FRONT_COMPONENT_CONTEXT_KEY];
  delete globalScope[FRONT_COMPONENT_LISTENERS_KEY];
});

describe('useFrontComponentExecutionContext', () => {
  it('settles when an inline selector returns a new object on each call', () => {
    act(() => root.render(<ObjectSelectorReader />));

    expect(renderCount).toBe(1);
    expect(lastSelectedFields).toEqual({
      recordId: 'record-id',
      selectedRecordIds: ['record-id'],
    });
  });

  it('does not re-render when the host pushes a context with the same selected values', () => {
    act(() => root.render(<ObjectSelectorReader />));

    act(() =>
      setExecutionContext({ ...EXECUTION_CONTEXT, colorScheme: 'dark' }),
    );

    expect(renderCount).toBe(1);
  });

  it('re-renders once with the new value when a selected field changes', () => {
    act(() => root.render(<ObjectSelectorReader />));

    act(() =>
      setExecutionContext({
        ...EXECUTION_CONTEXT,
        recordId: 'other-record-id',
        selectedRecordIds: ['other-record-id'],
      }),
    );

    expect(renderCount).toBe(2);
    expect(lastSelectedFields).toEqual({
      recordId: 'other-record-id',
      selectedRecordIds: ['other-record-id'],
    });
  });

  it('still returns primitive selections and updates them', () => {
    let selectedRecordId: string | null = null;
    let primitiveRenderCount = 0;

    const PrimitiveSelectorReader = () => {
      primitiveRenderCount += 1;
      selectedRecordId = useFrontComponentExecutionContext(
        (context) => context.recordId,
      );

      return null;
    };

    act(() => root.render(<PrimitiveSelectorReader />));
    expect(selectedRecordId).toBe('record-id');

    act(() =>
      setExecutionContext({ ...EXECUTION_CONTEXT, recordId: 'next-record-id' }),
    );

    expect(selectedRecordId).toBe('next-record-id');
    expect(primitiveRenderCount).toBe(2);
  });
});
