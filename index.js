"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function runQueue(tasks, parallelLimit) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!tasks.length || !parallelLimit)
            throw new Error('runQueue::BAD_PARAMETERS');
        return new Promise((resolve) => {
            let results = [];
            let taskIndex = tasks.length - 1;
            let runQueue = [];
            let queueStreamsLeft = parallelLimit;
            // Recursive function that uses object pooling 
            const queueNext = (result, queueIndex) => {
                results.push(result);
                if (!tasks[taskIndex]) {
                    queueStreamsLeft--;
                    if (queueStreamsLeft === 0) {
                        resolve(results);
                    }
                }
                if (queueStreamsLeft) {
                    runQueue[queueIndex].promise = tasks[taskIndex--]();
                    runQueue[queueIndex].promise.then(res => {
                        queueNext(res, queueIndex);
                    });
                }
            };
            for (let queueIndex = 0; queueIndex < parallelLimit; queueIndex++) {
                // different from getNext, as we have to construct the initial objects
                if (tasks[taskIndex]) {
                    runQueue[queueIndex] = {
                        queueIndex,
                        promise: tasks[taskIndex--]()
                    };
                    runQueue[queueIndex].promise.then(result => {
                        queueNext(result, queueIndex);
                    });
                }
                else {
                    if (runQueue.length)
                        return Promise.all(runQueue);
                }
            }
        });
    });
}
function tFun(n) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('start: ', n);
        return n;
    });
}
runQueue([() => tFun(0), () => tFun(1), () => tFun(2)], 1).then(results => {
    console.log(results);
});
