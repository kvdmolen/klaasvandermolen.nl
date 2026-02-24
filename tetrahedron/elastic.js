// const math = require('mathjs')


class Elastic {
	constructor(modeldata) {

		this.nodes = modeldata.nodes.map(node => {
			return {
				"org": node,
				"pos": node,
				"edges": [],
				"target": node,
				"totalforce": [0,0,0]
			}
		})

		this.edges = modeldata.edges.map(edge => {
			return {
				"nodes": edge,
				"vector": [0,0,0]
			}
		})

		this.nodesfixed = modeldata.nodesfixed

		this.strengthEdge = 0.5
		this.strengthTarget = 0.005

		// add Edge Index to Nodes
		for(let nodeidx = 0; nodeidx < this.nodes.length; nodeidx++){
			for(let edgeidx = 0; edgeidx < this.edges.length; edgeidx++){
				if(this.edges[edgeidx].nodes.indexOf(nodeidx) >= 0){
					this.nodes[nodeidx].edges.push({"edgeidx": edgeidx, "force": [0,0,0], "direction": this.edges[edgeidx].nodes[0] == nodeidx ? 1 : -1, "magnitude": 1})
				}
			}
		}
	}



	setTarget(nodeidx, target){
		this.nodes[nodeidx].target = this.nodes[nodeidx].org.add(target)
	}

	// Calculate unit vector for all elements. Direction of vector is arbatrary.
	calculate_element_vectors(){
		const nodesAll = this.nodes.map(n => n.pos).concat(this.nodesfixed)
		for(let edgeidx = 0; edgeidx < this.edges.length; edgeidx++){
			let edve_vector = nodesAll[this.edges[edgeidx].nodes[1]].substract(nodesAll[this.edges[edgeidx].nodes[0]])
			this.edges[edgeidx].vector = edve_vector.divideby(edve_vector.norm())
		}
	}

	calculate_point_force(){
		// use magnitude to calculate force of edge to point in direction of edge
		for(let nodeidx = 0; nodeidx < this.nodes.length; nodeidx++){
			this.nodes[nodeidx].totalforce = [0,0,0]
			this.nodes[nodeidx].edges.forEach((edge, edgeidx) => {
				this.nodes[nodeidx].edges[edgeidx].force = edge.direction > 0 ? this.edges[edge.edgeidx].vector.multiply(edge.magnitude) : this.edges[edge.edgeidx].vector.invert().multiply(edge.magnitude)
				this.nodes[nodeidx].totalforce = this.nodes[nodeidx].totalforce.add(this.nodes[nodeidx].edges[edgeidx].force)
			})
		}
	}

	// incrementally change the magnitude of the pulling vector
	calculate_new_magnitude(){
		for(let nodeidx = 0; nodeidx < this.nodes.length; nodeidx++){
			this.nodes[nodeidx].edges.forEach((edge, edgeidx) => {
				let projectedlength = this.nodes[nodeidx].totalforce.projecton(this.edges[edge.edgeidx].vector)
				this.nodes[nodeidx].edges[edgeidx].magnitude = (edge.magnitude + ((-1 * projectedlength) / 3)).range(0.2, 5)
			})
		}
	}

	calculate_new_positions(){
		for(let nodeidx = 0; nodeidx < this.nodes.length; nodeidx++){
			this.nodes[nodeidx].pos = this.nodes[nodeidx].pos.add(this.nodes[nodeidx].totalforce.multiply(this.strengthEdge))
			this.nodes[nodeidx].pos = this.nodes[nodeidx].pos.add(this.nodes[nodeidx].target.substract(this.nodes[nodeidx].pos).multiply(this.strengthTarget))
		}
	}

	interate() {
		this.calculate_element_vectors()
		this.calculate_point_force()
		this.calculate_new_magnitude()
		this.calculate_point_force()
		this.calculate_new_positions()
	}

	getNodes() {
		return this.nodes.map(el => {
			return el.pos
		})
	}

}



// module.exports = Elastic;
// const User = require('./user');
// const jim = new User('Jim', 37, 'jim@example.com');
// console.log(jim.getUserStats());
