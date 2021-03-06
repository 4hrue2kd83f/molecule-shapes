// Copyright 2014-2020, University of Colorado Boulder

/**
 * Base model that handles a single molecule
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */


import Property from '../../../../axon/js/Property.js';
// modules
import inherit from '../../../../phet-core/js/inherit.js';
import moleculeShapes from '../../moleculeShapes.js';

/**
 * @constructor
 * @param {boolean} isBasicsVersion
 * @param {Object} [options]
 */
function MoleculeShapesModel( isBasicsVersion ) {
  this.isBasicsVersion = isBasicsVersion; // @public {boolean}

  this.moleculeProperty = new Property( null ); // @public {Molecule} - Assumed not to change in the 1st screen (model)
  this.moleculeQuaternionProperty = new Property( new THREE.Quaternion() ); // @public {THREE.Quaternion} - describes the rotation of the molecule view
  this.showBondAnglesProperty = new Property( false ); // @public {boolean} - Whether bond angles are shown
  this.showLonePairsProperty = new Property( !isBasicsVersion ); // @public {boolean} - Whether lone pairs are shown
  this.showMolecularShapeNameProperty = new Property( false ); // @public {boolean} - Whether molecular shape names are shown
  this.showElectronShapeNameProperty = new Property( false ); // @public {boolean} - Whether electron shape names are shown
}

moleculeShapes.register( 'MoleculeShapesModel', MoleculeShapesModel );

inherit( Object, MoleculeShapesModel, {
  reset: function() {
    this.moleculeProperty.reset();
    this.moleculeQuaternionProperty.reset();
    this.showBondAnglesProperty.reset();
    this.showLonePairsProperty.reset();
    this.showMolecularShapeNameProperty.reset();
    this.showElectronShapeNameProperty.reset();
  },
  /**
   * Steps the model forward.
   * @public
   *
   * @param {number} dt - Elapsed time
   */
  step: function( dt ) {

    // cap at 0.2s, since our model doesn't handle oscillation well above that
    this.moleculeProperty.get().update( Math.min( dt, 0.2 ) );
  }
} );

export default MoleculeShapesModel;