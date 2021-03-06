window.addEventListener('load', pageFullyLoaded, false)

var allHeroes
var sceneEl
var fightBtn
var fightStatus = false
var count = 0
var startCollision = 0
var explosionMarker
function pageFullyLoaded(pageFullyLoaded) {
    allHeroes = document.querySelectorAll('.hero')
    sceneEl = document.querySelector('a-scene')
    fightBtn = document.querySelector('#fight-btn')
    camera = document.querySelector('#camera')
    selectionSound = document.querySelector('#selectionSound')
    initHeroesDisplay()

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
                // el.setAttribute('position', {
                //     x: 0,
                //     y: 0,
                //     z: 0,
                // })
                el.setAttribute('class', 'hero clickable')
            })
        },

        update: function () {},

        tick: function (time, timeDelta) {
            let data = this.data

            //console.log(this.el.parentNode.object3D.getWorldPosition())
            // if (fightStatus && !data.entityCollided && allHeroes.length >= 2) {
            if (countSelectedHeroes() >= 2 && !data.entityCollided && allHeroes.length >= 2) {
                let el = this.el
                let data = this.data
                let speed = this.speed
                let direction = this.direction
                let directionVec3 = this.directionVec3
                let distance = this.distance

                let currentPosition = el.getAttribute('position')
                //let currentPosition = el.parentNode.getAttribute('position')

                let destination = getSelectedFoe(el)
                //let destination = getSelectedFoe(el).parentNode

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
                }
            }
        },
    })

    AFRAME.registerComponent('fight-btn', {
        schema: {
            active: { type: 'boolean', default: false },
        },

        init: function () {
            let el = this.el
            this.pos = new THREE.Vector3()
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

        remove: function () {},

        tick: function (time, timeDelta) {
            let el = this.el
            let data = this.data
            let pos = this.pos
            if (count >= 3) {
                pos = getPositionOfSelectedHeroes()
                fightBtn.setAttribute('visible', true)
                el.setAttribute('position', {
                    x: (pos[0].x + pos[1].x) / 2,
                    y: (pos[0].y + pos[1].y) / 2,
                    z: (pos[0].z + pos[1].z) / 2,
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
                    fight()

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

    //************************************ HELPER FUNCTIONS ************************************ */
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

    function getAllSelected() {
        let selected = []
        allHeroes.forEach((hero) => {
            if (hero.getAttribute('test').selected) {
                selected.push(hero)
            }
        })
        return selected
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

    function initHeroesDisplay() {
        allHeroes.forEach((hero) => {
            hero.children[0].setAttribute(
                'text',
                'value',
                'Attack: ' + hero.getAttribute('attack') + ' \n' + 'Defense: ' + hero.getAttribute('defense')
            )
        })
    }

    function getPositionOfSelectedHeroes() {
        let selectedPos = []

        allHeroes.forEach((hero) => {
            if (hero.getAttribute('test').selected) {
                let heroPositionCopy = new THREE.Vector3()
                heroPositionCopy.copy(hero.getAttribute('position'))
                selectedPos.push(heroPositionCopy)
            }
        })
        return selectedPos
    }

    function fight() {
        let allSelected = getAllSelected()
        if (allSelected[0].getAttribute('defense') === allSelected[1].getAttribute('attack')) {
            explosionMarker = allSelected[0].parentNode
            explodeCard(explosionMarker)
            allSelected[0].parentNode.removeChild(allSelected[0])
            explosionMarker = allSelected[1].parentNode
            explodeCard(explosionMarker)
            allSelected[1].parentNode.removeChild(allSelected[1])
        } else if (allSelected[0].getAttribute('defense') < allSelected[1].getAttribute('attack')) {
            explosionMarker = allSelected[0].parentNode
            allSelected[0].parentNode.removeChild(allSelected[0])
            explodeCard(explosionMarker)
        } else {
            explosionMarker = allSelected[1].parentNode
            allSelected[1].parentNode.removeChild(allSelected[1])
            explodeCard(explosionMarker)
        }

        allHeroes.forEach((hero) => {
            if (hero.getAttribute('test').selected) {
                hero.getAttribute('test').selected = false
            }
        })
        return
    }

    function explodeCard(markerToExplode) {
        let explosion = document.createElement('a-entity')
        explosion.setAttribute('gltf-model', '#explosion')
        explosion.setAttribute('scale', '0.007 0.007 0.007')
        explosion.setAttribute('animation-mixer', 'clip', 'Take 001')
        explosion.setAttribute('animation-mixer', 'loop', 'once')
        explosion.setAttribute('animation-mixer', 'clampWhenFinished', 'true')
        explosion.setAttribute('animation-mixer', 'timeScale', '0.4')
        markerToExplode.appendChild(explosion)
    }
}
