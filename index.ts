type RunQueueEntry = {
    queueIndex: number;
    promise: Promise<unknown>;
};

async function runQueue(tasks: Array<Function>, parallelLimit: number) {
    if (!tasks.length || !parallelLimit) throw new Error('runQueue::BAD_PARAMETERS');

    return new Promise((resolve) => {
        let results: unknown[] = [];
        let taskIndex = tasks.length - 1;
        let runQueue: RunQueueEntry[] = [];
        let queueStreamsLeft = parallelLimit;

        // Recursive function that uses object pooling 
        const queueNext = (result: unknown, queueIndex: number) => {
            results.push(result);

            if (!tasks[taskIndex]){ 
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
                } as RunQueueEntry;

                runQueue[queueIndex].promise.then(result => {
                    queueNext(result, queueIndex);
                });
            } else {
                if (runQueue.length) return Promise.all(runQueue);
            }
        }
    });
}

async function tFun(n: number) {
    console.log('start: ', n);
    return n;
}

runQueue([() => tFun(0), () => tFun(1), () => tFun(2)], 1).then(results => {
    console.log(results);
});