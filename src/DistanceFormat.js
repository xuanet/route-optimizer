const ax = require('axios')

class DistanceFormat {
    constructor(start, end, places) {
        this.start = start
        this.end = end
        this.places = places

        this.idMap = new Map()
        this.startMap = new Map()
        this.endMap = new Map()
        this.placeMap = new Map()
        this.numTypes = places.length

        this.currBestTime = Number.MAX_SAFE_INTEGER
        this.bestPathTime = []

        this.currBestDistance = Number.MAX_SAFE_INTEGER
        this.bestPathDistance = []
    }

    printPlace() {
        console.log('inside df', this.start)
    }

    async optimize() {
        // create id map
        this.assignId()
        console.log(this.idMap)
        
        // create distance from start and end
        await this.startEndMapify()
        
        // create relation map w/ distance matrix
        await this.mapify()

        // for every first stop, backpropogate
        for (let id of this.startMap.keys()) {
            this.backPropagateTime(id, new Set([id]), new Set([this.idMap.get(id).type]), [id], this.startMap.get(id).travelTime)
        }
        
        console.log(this.bestPathTime)
        console.log(this.currBestTime)

        for (let id of this.startMap.keys()) {
            this.backPropagateDistance(id, new Set([id]), new Set([this.idMap.get(id).type]), [id], this.startMap.get(id).distance)
        }

        console.log(this.bestPathDistance)
        console.log(this.currBestDistance)
    }


    // calculate distance between each places


    assignId() {
        let idCounter = 0
        let typeCounter = 0
        for (let i = 0; i<this.places.length; i++) {
            let currType = this.places[i]
            for (let j = 0; j<currType.length; j++) {
                this.idMap.set(idCounter, {name: currType[j].name, address: currType[j].address, type: typeCounter})
                idCounter++
            }
            typeCounter++
        }

    }

    async startEndMapify() {
        for (let i = 0; i<this.idMap.size; i++) {
            let startMetrics = await this.fetchDistance(this.start, this.idMap.get(i).address)
            let endMetrics = await this.fetchDistance(this.end, this.idMap.get(i).address)
            this.startMap.set(i, {travelTime: startMetrics.duration, distance: startMetrics.distance})
            this.endMap.set(i, {travelTime: endMetrics.duration, distance: endMetrics.distance})
        }
    }

    async mapify() {
        let map = new Map()
        for (let i = 0; i<this.idMap.size; i++) {
            // create the key
            map.set(i, [])
            let currentType = this.idMap.get(i).type
            // iterate through all possible neighbors, keeping only ones with different type
            for (let j = 0; j<this.idMap.size; j++) {
                if (currentType !== this.idMap.get(j).type) {
                    // calculate travelTime and distance with Distance Matrix
                    let metrics = await this.fetchDistance(this.idMap.get(i).address, this.idMap.get(j).address)
                    map.get(i).push({id: j, type: this.idMap.get(j).type, travelTime: metrics.duration, distance: metrics.distance})
                }
            }
        }
        this.placeMap = map
    }

    fetchDistance(startAddress, endAddress) {

        let responseData = {distance: 0, duration: 0}

        let urlBase = 'https://maps.googleapis.com/maps/api/distancematrix/json'
        let destinations = '?destinations=' + startAddress
        let origins = '&origins=' + endAddress
        let units = '&units=metric'
        let apiKey = '&key=AIzaSyA438rz5gimhiPCCyXYR64pG6813qJUnA8'

        let url = urlBase + destinations + origins + units + apiKey

        return new Promise((resolve, reject) => {
            ax.get(url)
            .then(response => {
                responseData = {distance: response.data.rows[0].elements[0].distance.value, duration: response.data.rows[0].elements[0].duration.value}
                resolve(responseData)
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error)
            });
        })


    }

    backPropagateTime(currentId, visitedId, visitedTypes, currentPath, elapsedTime) {
        // elapsedTime >= bestTime
        if (elapsedTime >= this.currBestTime) return
        // visited all types, must go to end
        if (visitedTypes.size === this.numTypes) {
            if (this.endMap.get(currentId).travelTime + elapsedTime < this.currBestTime) {
                // found a better path
                this.bestPathTime = structuredClone(currentPath)
                this.currBestTime = this.endMap.get(currentId).travelTime + elapsedTime
            }
            return
        }
        // iterate
        let nextStops = this.placeMap.get(currentId)
        nextStops.forEach((place) => {
            // can't be type already visited, can't be id already visited
            if (!visitedTypes.has(place.type) || !visitedId.has(place.id)) {
                visitedId.add(place.id)
                visitedTypes.add(place.type)
                currentPath.push(place.id)

                this.backPropagateTime(place.id, visitedId, visitedTypes, currentPath, elapsedTime + place.travelTime)

                // un-update
                visitedId.delete(place.id)
                visitedTypes.delete(place.type)
                currentPath.pop()
                
            }
        })

        return
    }


    backPropagateDistance(currentId, visitedId, visitedTypes, currentPath, elapsedDistance) {
        // elapsedTime >= bestDist
        if (elapsedDistance >= this.currBestDistance) return
        // visited all types, must go to end
        if (visitedTypes.size === this.numTypes) {
            if (this.endMap.get(currentId).distance + elapsedDistance < this.currBestDistance) {
                // found a better path
                this.bestPathDistance = structuredClone(currentPath)
                this.currBestDistance = this.endMap.get(currentId).distance + elapsedDistance
            }
            return
        }
        // iterate
        let nextStops = this.placeMap.get(currentId)
        nextStops.forEach((place) => {
            // can't be type already visited, can't be id already visited
            if (!visitedTypes.has(place.type) || !visitedId.has(place.id)) {
                visitedId.add(place.id)
                visitedTypes.add(place.type)
                currentPath.push(place.id)

                this.backPropagateDistance(place.id, visitedId, visitedTypes, currentPath, elapsedDistance + place.distance)

                // un-update
                visitedId.delete(place.id)
                visitedTypes.delete(place.type)
                currentPath.pop()
                
            }
        })

        return
    }
}

module.exports = DistanceFormat;

let fakePlaces = [[{name: 'my house', address: '201 William Henry Way, Cary'}, {name: 'high school', address: '2500 Carpenter Upchurch Rd, Cary'}, {name: 'middel school', address: '2101 Davis Dr, Cary'}],
[{name: 'gyno', address: '6102 Grace Park Dr, Morrisville'}, {name: 'library', address: '4000 Louis Stephens Dr, Cary'}, {name: 'food lion', address: '8745 Holly Springs Rd, Apex'}]]

const test = new DistanceFormat('2100 Morrisville Pkwy, Cary', '6770 McCrimmon Pkwy, Cary', fakePlaces)


// async function asyncDistance(DistanceFormatInstance) {
//     let k = await DistanceFormatInstance.fetchDistance('201 William Henry Way, Cary', '2500 Carpenter Upchurch Rd, Cary')
//     console.log(k)
// }

test.optimize()

// let k = test.fetchDistance('201 William Henry Way, Cary', '2500 Carpenter Upchurch Rd, Cary')
// .then(response => {
//     console.log(response)
// })
// .catch(error => {
//     console.log(error)
// })

// asyncDistance(test)
// console.log(asyncDistance(test))

// (async () => {
//     try {
//         const response = await test.fetchDistance('201 William Henry Way, Cary', '2500 Carpenter Upchurch Rd, Cary');
//         console.log(response);
//     } catch (error) {
//         console.error(error);
//     }
// })();


// export default DistanceFormat