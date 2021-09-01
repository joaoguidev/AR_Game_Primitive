window.addEventListener('load', pageFullyLoaded, false)

var allHeroes
var sceneEl
var fightBtn
var fightStatus = false
var count = 0
var startCollision = 0
function pageFullyLoaded(pageFullyLoaded) {
    allHeroes = document.querySelectorAll('.hero')
    sceneEl = document.querySelector('a-scene')
    fightBtn = document.querySelector('#fight-btn')

    AFRAME.registerComponent('test', {
        schema: {
            target: { type: 'selectorAll', default: '.hero' },
            selected: { type: 'boolean', default: false },
            entityCollided: { type: 'boolean', default: false },
        },

        init: function () {
            let el = this.el

            let data = this.data
            this.speed = 2
            this.direction = new THREE.Vector3()
            this.distance = 0
            this.directionVec3 = new THREE.Vector3()
            el.addEventListener('click', function (evt) {
                if (countSelectedHeroes() <= 2) {
                    if (!data.selected) {
                        count++
                        data.selected = true
                    }
                }
            })
            el.parentNode.addEventListener('markerFound', function (evt) {
                el.setAttribute('position', {
                    x: 0,
                    y: 0,
                    z: 0,
                })
            })
            el.parentNode.addEventListener('markerLost', function (evt) {
                el.setAttribute('position', {
                    x: 0,
                    y: 0,
                    z: 5,
                })
            })
        },

        update: function () {},

        tick: function (time, timeDelta) {
            let data = this.data
            if (fightStatus && !data.entityCollided && allHeroes.length >= 2) {
                let el = this.el
                let data = this.data
                let speed = this.speed
                let direction = this.direction
                let directionVec3 = this.directionVec3
                let distance = this.distance
                let currentPosition = el.getAttribute('position')
                // let destination = getClosestHero(el, currentPosition)
                let destination = getSelectedFoe(el)
                let destinationPosition = destination.getAttribute('position')
                distance = direction.copy(destinationPosition).sub(currentPosition).length()
                direction = direction.copy(destinationPosition).sub(currentPosition).normalize()
                directionVec3.copy(destinationPosition).sub(currentPosition)
                let factor = speed / distance
                if (distance >= 2) {
                    this.el.setAttribute('position', {
                        x: currentPosition.x + (directionVec3.x *= factor * (timeDelta / 1000)),
                        y: currentPosition.y + (directionVec3.y *= factor * (timeDelta / 1000)),
                        z: currentPosition.z + (directionVec3.z *= factor * (timeDelta / 1000)),
                    })
                    el.object3D.lookAt(destinationPosition)
                } else {
                    data.entityCollided = true
                    ++startCollision
                    sceneEl.emit('collision', { position: currentPosition }, true)
                    //console.log(el.emit('collision', {}, true))
                }
            }
        },
    })

    function getSelectedFoe(currentEl) {
        let selectedFoe
        allHeroes.forEach((hero) => {
            if (hero !== currentEl) {
                if (hero.getAttribute('test').selected) {
                    selectedFoe = hero
                }
            }
        })
        return selectedFoe
    }

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

    function countSelectedHeroes() {
        let counter = 0
        allHeroes.forEach((hero) => {
            if (hero.getAttribute('test').selected) {
                counter++
            }
        })
        return counter
    }

    AFRAME.registerComponent('fight-btn', {
        schema: {
            active: { type: 'boolean', default: false },
        },

        init: function () {
            let el = this.el
            el.addEventListener('click', function (evt) {
                if (countSelectedHeroes() >= 2) {
                    fightStatus = true
                }
                //fightBtn.setAttribute('visible', false)
            })
        },

        update: function () {
            let el = this.el
            let data = this.data
        },

        tick: function (time, timeDelta) {
            let el = this.el
            let data = this.data
            if (count >= 2) {
                fightBtn.setAttribute('visible', true)
                el.setAttribute('position', {
                    x: 0,
                    y: -0.1,
                    z: -1,
                })
            } else {
                fightBtn.setAttribute('visible', false)
                el.setAttribute('position', {
                    x: 0,
                    y: 0.5,
                    z: 1,
                })
            }
        },
    })

    AFRAME.registerComponent('collision-listener', {
        init: function () {
            let el = this.el
            el.addEventListener('collision', function (evt) {
                if (startCollision == 2) {
                    let explosion = document.createElement('a-entity')
                    let explosionPosition =
                        evt.detail.position.x + ' ' + evt.detail.position.y + ' ' + evt.detail.position.z
                    explosion.setAttribute('gltf-model', '#explosion')
                    explosion.setAttribute('scale', '0.002 0.002 0.002')
                    explosion.setAttribute('position', explosionPosition)
                    explosion.setAttribute('animation-mixer', 'clip', 'Take 001')
                    explosion.setAttribute('animation-mixer', 'loop', 'once')
                    explosion.setAttribute('animation-mixer', 'clampWhenFinished', 'true')
                    explosion.setAttribute('animation-mixer', 'timeScale', '0.5')
                    sceneEl.appendChild(explosion)
                    startCollision = 0
                    fightStatus = false
                    count = 0
                }
            })
        },

        update: function () {},

        remove: function () {},

        tick: function (time, timeDelta) {},
    })
}
