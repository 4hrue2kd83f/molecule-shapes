// Copyright 2013-2020, University of Colorado Boulder

/**
 * A molecule that behaves with a behavior that doesn't discriminate between bond or atom types (only lone pairs vs
 * bonds). Used in the "Model" screens.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import inherit from '../../../../phet-core/js/inherit.js';
import moleculeShapes from '../../moleculeShapes.js';
import Molecule from './Molecule.js';
import PairGroup from './PairGroup.js';

/*
 * @constructor
 * @param {number} bondLengthOverride - Override the length of the displayed bond (the bond will not stretch between
 *                                      both atoms, but will be able to detach from the central atom to stay the same
 *                                      length)
 */
function VSEPRMolecule( bondLengthOverride ) {
  Molecule.call( this, false );

  this.bondLengthOverride = bondLengthOverride; // @public {number}
}

moleculeShapes.register( 'VSEPRMolecule', VSEPRMolecule );

inherit( Molecule, VSEPRMolecule, {
  /**
   * Steps the model.
   * @override
   * @public
   *
   * @param {number} dt - Amount of time elapsed
   */
  update: function( dt ) {
    Molecule.prototype.update.call( this, dt );

    const radialGroups = this.radialGroups;

    // coulomb-style repulsion around the central atom (or angle-based for terminal lone pairs)
    for ( let i = 0; i < this.atoms.length; i++ ) {
      const atom = this.atoms[ i ];
      if ( this.getNeighborCount( atom ) > 1 ) {
        if ( atom.isCentralAtom ) {
          // attractive force to the correct position
          const error = this.getLocalShape( atom ).applyAttraction( dt );

          // factor that basically states "if we are close to an ideal state, force the coulomb force to ignore differences between bonds and lone pairs based on their distance"
          const trueLengthsRatioOverride = Math.max( 0, Math.min( 1, Math.log( error + 1 ) - 0.5 ) );

          for ( let j = 0; j < radialGroups.length; j++ ) {
            const group = radialGroups[ j ];
            for ( let k = 0; k < radialGroups.length; k++ ) {
              const otherGroup = radialGroups[ k ];

              if ( otherGroup !== group && group !== this.centralAtom ) {
                group.repulseFrom( otherGroup, dt, trueLengthsRatioOverride );
              }
            }
          }
        }
        else {
          // handle terminal lone pairs gracefully
          this.getLocalShape( atom ).applyAngleAttractionRepulsion( dt );
        }
      }
    }
  },

  /**
   * Returns the LocalShape around a specific atom.
   * @public
   *
   * @param {PairGroup} atom
   * @returns {LocalShape}
   */
  getLocalShape: function( atom ) {
    return this.getLocalVSEPRShape( atom );
  },

  /**
   * Returns the maximum bond length (either overridden, or the normal bonded pair distance).
   * @override
   * @public
   *
   * @returns {number}
   */
  getMaximumBondLength: function() {
    if ( this.bondLengthOverride !== undefined ) {
      return this.bondLengthOverride;
    }
    else {
      return PairGroup.BONDED_PAIR_DISTANCE;
    }
  }
} );

export default VSEPRMolecule;