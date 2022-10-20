## 'Reduce like' filter on transform stream

The idea is to create a transform stream that will act like a `.reduce()` method, where it will check if the current chunk of data corresponds to given criteria and if not, it will wait to be combined with the next chunk until it the current data in place pass the criteria.