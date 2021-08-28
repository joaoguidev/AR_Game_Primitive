var allHeroes = document.querySelectorAll('.hero')

AFRAME.registerComponent('test', {
    schema: {
        target: { type: 'selectorAll', default: '.hero' },
    },

    init: function () {
        // Do something when component first attached.
        let el = this.el
        let data = this.data
        this.speed = 2
        this.direction = new THREE.Vector3()
        this.distance = 0
        this.directionVec3 = new THREE.Vector3()
    },

    update: function () {
        // Do something when component's data is updated.
    },

    remove: function () {
        // Do something the component or its entity is detached.
    },

    tick: function (time, timeDelta) {
        // Do something on every scene tick or frame.
        let el = this.el
        let data = this.data
        let speed = this.speed
        let direction = this.direction
        let directionVec3 = this.directionVec3
        let distance = this.distance
        let currentPosition = el.getAttribute('position')
        let destination = getClosestHero(el, currentPosition)
        let destinationPosition = destination.getAttribute('position')

        let factor = speed / distance

        distance = direction.copy(destinationPosition).sub(currentPosition).length()
        direction = direction.copy(destinationPosition).sub(currentPosition).normalize()
        directionVec3.copy(destinationPosition).sub(currentPosition)
		if (distance >= 2) {
            this.el.setAttribute('position', {
                x: currentPosition.x + (directionVec3.x *= (speed / distance) * (timeDelta / 1000)),
                y: currentPosition.y + (directionVec3.y *= (speed / distance) * (timeDelta / 1000)),
                z: currentPosition.z + (directionVec3.z *= (speed / distance) * (timeDelta / 1000)),
            })
            el.object3D.lookAt(destinationPosition)
        }
		console.log(distance)
    },
})

function getClosestHero(currentEl, currentPos) {
    let closestHero = Number.MAX_VALUE
    let heroPositionCopy = new THREE.Vector3()
    let currentPosCopy = new THREE.Vector3()
    currentPosCopy.copy(currentPos)

    allHeroes.forEach((hero) => {
        heroPositionCopy.copy(hero.getAttribute('position'))
        let distanceToHero = heroPositionCopy.sub(currentPosCopy).length()

        if (currentEl !== hero) {
            if (closestHero > distanceToHero) {
                closestHero = hero
            }
        }
    })
    return closestHero
}
