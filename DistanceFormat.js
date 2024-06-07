const axios = require('axios')

class DistanceFormat {
    constructor(start, end, places) {

        this.start = start
        this.end = end
        this.places = places
        this.flattenedPlaces = []


        this.idMap = new Map()
        this.typeMap = new Map()
        this.startMap = new Map()
        this.endMap = new Map()
        this.placeMap = new Map()
        this.numTypes = places.length


        this.numPathsTimeChecked = 0
        this.currBestTime = Number.MAX_SAFE_INTEGER
        this.bestPathTime = []

        this.numPathsDistanceChecked = 0
        this.currBestDistance = Number.MAX_SAFE_INTEGER
        this.bestPathDistance = []
    }

    async optimize() {
        // create id map
        this.assignTypeAndId()
        
        // create distance from start and end
        await this.startEndMapify()
        
        // create relation map w/ distance matrix
        await this.mapify()

        console.log('all distances fetched')

        // console.log(this.placeMap)
        // console.log(this.startMap)
        // console.log(this.endMap)

        // for every first stop, backpropogate
        for (let address of this.startMap.keys()) {
            this.backPropagateTime(address, new Set([this.typeMap.get(address)]), [address], this.startMap.get(address).travelTime)
        }
        
        console.log('optimal time path found')
        console.log(this.bestPathTime)
        console.log('paths checked', this.numPathsTimeChecked)
        console.log('best time', this.currBestTime)

        for (let address of this.startMap.keys()) {
            this.backPropagateDistance(address, new Set([this.typeMap.get(address)]), [address], this.startMap.get(address).distance)
        }

        console.log('optimal distance path found')
        console.log(this.bestPathDistance)
        console.log('paths checked', this.numPathsDistanceChecked)
        console.log('best distance', this.currBestDistance)
    }


    assignTypeAndId() {
        let counter = 0
        for (let type = 0; type<this.places.length; type++) {
            let placeList = this.places[type]
            for (let place = 0; place<placeList.length; place++) {
                const currentAddress = placeList[place].address
                if (this.typeMap.has(currentAddress)) {
                    console.log(currentAddress, ' already in map')
                    continue
                }
                this.typeMap.set(currentAddress, type)
                this.idMap.set(counter, currentAddress)
                counter++
            }
        }

        this.flattenedPlaces = this.places.flatMap(placeList => placeList.map(place => place.address))
    }

    async startEndMapify() {
        const startMetrics = await this.fetchDistance([this.start.address], this.flattenedPlaces)
        for (let index = 0; index<startMetrics.rows[0].elements.length; index++) {
            this.startMap.set(this.idMap.get(index), {travelTime: startMetrics.rows[0].elements[index].duration_in_traffic.value, distance: startMetrics.rows[0].elements[index].distance.value})
        }


        const endMetrics = await this.fetchDistance(this.flattenedPlaces, [this.end.address])
        for (let index = 0; index<endMetrics.rows.length; index++) {
            this.endMap.set(this.idMap.get(index), {travelTime: endMetrics.rows[index].elements[0].duration_in_traffic.value, distance: endMetrics.rows[index].elements[0].distance.value})
        }
    }

    async mapify() {

        const blockSize = Math.floor(100 / this.flattenedPlaces.length)
        for (let startIndex = 0; startIndex < this.flattenedPlaces.length; startIndex += blockSize) {
            // create the small strip
            const startStrip = this.flattenedPlaces.slice(startIndex, startIndex+blockSize)
            const metrics = await this.fetchDistance(startStrip, this.flattenedPlaces)

            for (let row = 0; row<metrics.rows.length; row++) {
                const currRow = metrics.rows[row]
                // create this entry in map
                const currAddress = this.idMap.get(row+startIndex)
                const currAddressType = this.typeMap.get(currAddress)
                this.placeMap.set(currAddress, [])
                for (let element = 0; element<currRow.elements.length; element++) {
                    // item to be considered
                    const potentialNeighborAddress = this.idMap.get(element)
                    const potentialNeighborType = this.typeMap.get(potentialNeighborAddress)
                    // only add if different type and id
                    if (potentialNeighborType !== currAddressType) {
                        this.placeMap.get(currAddress).push({address: potentialNeighborAddress, type: 
                            potentialNeighborType, travelTime: currRow.elements[element].duration_in_traffic.value, distance: currRow.elements[element].distance.value})
                    }
                    
                }
            }
        }


    }

    fetchDistance(startAddresses, endAddresses) {

        const urlBase = 'https://maps.googleapis.com/maps/api/distancematrix/json'
        const origins = 'origins=' + startAddresses.map(address => this.encodeAddress(address)).join('|');
        const destinations = 'destinations=' + endAddresses.map(address => this.encodeAddress(address)).join('|');
        const units = '&units=metric'
        const avoid = '&avoid=tolls'; // Add this line to avoid tolls
        const departureTime = '&departure_time=now'; // Use 'now' or a Unix timestamp in seconds
        const apiKey = '&key=AIzaSyA438rz5gimhiPCCyXYR64pG6813qJUnA8'

        const url = `${urlBase}?${origins}&${destinations}${units}${avoid}${departureTime}${apiKey}`;

        return new Promise((resolve, reject) => {
            axios.get(url)
            .then(response => {
                resolve(response.data)
            })
            .catch(error => {
                console.error('Error:', error);
                reject(error)
            });
        })
    }

    encodeAddress = (address) => encodeURIComponent(address);

    backPropagateTime(currentAddress, visitedTypes, currentPath, elapsedTime) {
        this.numPathsTimeChecked++
        // elapsedTime >= bestTime
        if (elapsedTime >= this.currBestTime) {
            return
        }
        // visited all types, must go to end
        if (visitedTypes.size === this.numTypes) {
            if (this.endMap.get(currentAddress).travelTime + elapsedTime < this.currBestTime) {
                // found a better path
                this.bestPathTime = structuredClone(currentPath)
                this.currBestTime = this.endMap.get(currentAddress).travelTime + elapsedTime
            }
            return
        }
        // iterate

        // console.log(this.placeMap)
    
        let nextStops = this.placeMap.get(currentAddress)

        nextStops.forEach((place) => {
            // can't be type already visited, can't be id already visited
            if (!visitedTypes.has(place.type)) {
                visitedTypes.add(place.type)
                currentPath.push(place.address)

                this.backPropagateTime(place.address, visitedTypes, currentPath, elapsedTime + place.travelTime)

                // un-update
                visitedTypes.delete(place.type)
                currentPath.pop()
                
            }
        })

        return
    }


    backPropagateDistance(currentAddress, visitedTypes, currentPath, elapsedDistance) {
        this.numPathsDistanceChecked++
        // elapsedTime >= bestTime
        if (elapsedDistance >= this.currBestDistance) {
            return
        }
        // visited all types, must go to end
        if (visitedTypes.size === this.numTypes) {
            if (this.endMap.get(currentAddress).distance + elapsedDistance < this.currBestDistance) {
                // found a better path
                this.bestPathDistance = structuredClone(currentPath)
                this.currBestDistance = this.endMap.get(currentAddress).distance + elapsedDistance
            }
            return
        }
        // iterate
        let nextStops = this.placeMap.get(currentAddress)
        nextStops.forEach((place) => {
            // can't be type already visited, can't be id already visited
            if (!visitedTypes.has(place.type)) {
                visitedTypes.add(place.type)
                currentPath.push(place.address)

                this.backPropagateDistance(place.address, visitedTypes, currentPath, elapsedDistance + place.distance)

                // un-update
                visitedTypes.delete(place.type)
                currentPath.pop()
                
            }
        })

        return
    }
}

module.exports = DistanceFormat;