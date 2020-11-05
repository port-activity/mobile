/*
MIT License

Copyright (c) 2019 Sébastien Lorber

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import React, { useCallback, useEffect, useRef, useState } from 'react';

export type SyncSetState<S> = (stateUpdate: React.SetStateAction<S>) => void;
export type AsyncSetState<S> = (stateUpdate: React.SetStateAction<S>) => Promise<S>;

export const useAsyncSetStateFunction = <S>(state: S, setState: SyncSetState<S>): AsyncSetState<S> => {
  // hold resolution function for all setState calls still unresolved
  const resolvers = useRef<((state: S) => void)[]>([]);

  // ensure resolvers are called once state updates have been applied
  useEffect(() => {
    resolvers.current.forEach((resolve) => resolve(state));
    resolvers.current = [];
  }, [state]);

  // make setState return a promise
  return useCallback(
    (stateUpdate: React.SetStateAction<S>) => {
      return new Promise<S>((resolve, reject) => {
        setState((stateBefore) => {
          try {
            const stateAfter = stateUpdate instanceof Function ? stateUpdate(stateBefore) : stateUpdate;

            // If state does not change, we must resolve the promise because react won't re-render and effect will not resolve
            if (stateAfter === stateBefore) {
              resolve(stateAfter);
            }
            // Else we queue resolution until next state change
            else {
              resolvers.current.push(resolve);
            }
            return stateAfter;
          } catch (e) {
            reject(e);
            throw e;
          }
        });
      });
    },
    [setState]
  );
};

export const useAsyncSetState = <S>(initialState: S): [S, AsyncSetState<S>] => {
  const [state, setState] = useState(initialState);
  const setStateAsync = useAsyncSetStateFunction(state, setState);
  return [state, setStateAsync];
};

export const useGetState = <S>(state: S): (() => S) => {
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  });
  return useCallback(() => stateRef.current, [stateRef]);
};
