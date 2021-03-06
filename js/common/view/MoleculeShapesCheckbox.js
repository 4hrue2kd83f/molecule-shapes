// Copyright 2014-2020, University of Colorado Boulder

/**
 * A Checkbox with customized color handling for Molecule Shapes
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Checkbox from '../../../../sun/js/Checkbox.js';
import moleculeShapes from '../../moleculeShapes.js';
import MoleculeShapesColorProfile from './MoleculeShapesColorProfile.js';

class MoleculeShapesCheckbox extends Checkbox {

  /**
   * @param {Node} content
   * @param {Property.<boolean>} property
   * @param {Object} [options]
   */
  constructor( content, property, options ) {
    super( content, property, options );

    MoleculeShapesColorProfile.checkboxProperty.linkAttribute( this, 'checkboxColor' );
    MoleculeShapesColorProfile.checkboxBackgroundProperty.linkAttribute( this, 'checkboxColorBackground' );
  }
}

moleculeShapes.register( 'MoleculeShapesCheckbox', MoleculeShapesCheckbox );
export default MoleculeShapesCheckbox;