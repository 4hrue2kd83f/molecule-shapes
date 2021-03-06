// Copyright 2014-2020, University of Colorado Boulder

/**
 * View of an individual electron in a cloud {THREE.Object3D}
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inherit from '../../../../../phet-core/js/inherit.js';
import moleculeShapes from '../../../moleculeShapes.js';
import MoleculeShapesGlobals from '../../MoleculeShapesGlobals.js';
import MoleculeShapesColorProfile from '../MoleculeShapesColorProfile.js';
import LocalGeometry from './LocalGeometry.js';
import LocalMaterial from './LocalMaterial.js';

// controls resolution for the sphere (number of samples in both directions)
const NUM_SAMPLES = MoleculeShapesGlobals.useWebGLProperty.get() ? 10 : 3;

// renderer-local access
const localElectronGeometry = new LocalGeometry( new THREE.SphereGeometry( 0.25, NUM_SAMPLES, NUM_SAMPLES ) );
const localElectronMaterial = new LocalMaterial( new THREE.MeshLambertMaterial( {
  overdraw: MoleculeShapesGlobals.useWebGLProperty.get() ? 0 : 0.5 // amount to extend polygons when using Canvas to avoid cracks
} ), {
  color: MoleculeShapesColorProfile.lonePairElectronProperty
} );

/*
 * @constructor
 * @param {THREE.Renderer} renderer
 */
function ElectronView( renderer ) {
  THREE.Mesh.call( this, localElectronGeometry.get( renderer ), localElectronMaterial.get( renderer ) );
}

moleculeShapes.register( 'ElectronView', ElectronView );

inherit( THREE.Mesh, ElectronView );
export default ElectronView;