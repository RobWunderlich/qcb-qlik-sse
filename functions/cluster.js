const q = require('qlik-sse');
const kmeans = require('ml-kmeans'); // need to install this dependency

const functionDefinition = function cluster(request) {
  request.on('data', (bundle) => {
    const pairs = [];
    bundle.rows.forEach((row) => {
      pairs.push([row.duals[0].numData, row.duals[1].numData]);
    });
    const k = kmeans(pairs, 1);
    const rows = k.clusters.map(c => ({
      duals: [{ numData: c }],
    }));
    request.write({ rows });
  });
}

const functionConfig = {
    name: 'Cluster',
    functionType: q.sse.FunctionType.TENSOR,
    returnType: q.sse.DataType.NUMERIC,
    params: [
        {
            name: 'x',
            dataType: q.sse.DataType.NUMERIC,
        }, 
        {
            name: 'y',
            dataType: q.sse.DataType.NUMERIC,
        }, 
        {
            name: 'numClusters',
            dataType: q.sse.DataType.NUMERIC,
        }
    ],
}

module.exports = {
    functionDefinition,
    functionConfig
  };