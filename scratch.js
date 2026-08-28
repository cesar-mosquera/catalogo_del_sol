const params = {
    baseFee: 2.00,
    ratePerKm: 0.50,
    includedKm: 2,
    integerDistanceMode: 'floor',
};

function testDistance(distanceKm) {
  let distToCharge = distanceKm;
  if (params.integerDistanceMode === 'floor') distToCharge = Math.floor(distanceKm);
  const fee = params.includedKm && params.includedKm > 0
    ? Number((params.baseFee + Math.max(0, distToCharge - params.includedKm) * params.ratePerKm).toFixed(2))
    : Number((params.baseFee + distToCharge * params.ratePerKm).toFixed(2));
  return { distToCharge, fee };
}

console.log("1.5km:", testDistance(1.5));
console.log("2.8km:", testDistance(2.8));
console.log("2.9km:", testDistance(2.9));
console.log("3.1km:", testDistance(3.1));
console.log("3.9km:", testDistance(3.9));
console.log("4.5km:", testDistance(4.5));
console.log("10.2km:", testDistance(10.2));
