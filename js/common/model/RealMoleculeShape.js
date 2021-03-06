// Copyright 2013-2020, University of Colorado Boulder

/**
 * Represents a 'real' molecule with exact positions, as opposed to a molecule model (which is VSEPR-based
 * and doesn't include other information).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import DotUtils from '../../../../dot/js/Utils.js'; // eslint-disable-line require-statement-match
import Vector3 from '../../../../dot/js/Vector3.js';
import Element from '../../../../nitroglycerin/js/Element.js';
import inherit from '../../../../phet-core/js/inherit.js';
import moleculeShapes from '../../moleculeShapes.js';
import Bond from './Bond.js';
import GeometryConfiguration from './GeometryConfiguration.js';
import RealAtomPosition from './RealAtomPosition.js';

// Instead of the absolute positioning, this (for now) sets the bond lengths to be the same, since for our purposes
// they are all very close.
const USE_SIMPLIFIED_BOND_LENGTH = true;

/*
 * @constructor
 * @param {string} displayName - The displayed chemical name. Digits will be turned into subscripts, so use "H20", etc.
 * @param {number | null} bondLengthOverride - If USE_SIMPLIFIED_BOND_LENGTH, this will be used as the bond length for
 *                                             all atoms.
 */
function RealMoleculeShape( displayName, bondLengthOverride ) {
  this.displayName = displayName; // @public {string}
  this.bondLengthOverride = bondLengthOverride * 5.5; // @public {number} upscale the true size to our model units

  this.atoms = []; // @public {Array.<RealAtomPosition>}
  this.bonds = []; // @public {Array.<Bond>}
  this.centralAtom = null; // @public {RealAtomPosition | null} - Will be filled in later before use.

  this.centralAtomCount = 0; // @public {number}
}

moleculeShapes.register( 'RealMoleculeShape', RealMoleculeShape );

inherit( Object, RealMoleculeShape, {
  /**
   * Adds an atom position.
   * @public
   *
   * @param {RealAtomPosition} atom
   */
  addAtom: function( atom ) {
    assert && assert( this.atoms.indexOf( atom ) === -1 );

    this.atoms.push( atom );
  },

  /**
   * Adds a bond between two atom positions
   * @public
   *
   * @param {RealAtomPosition} a
   * @param {RealAtomPosition} b
   * @param {number} order - Order of the bond, 0 for lone pair.
   * @param {number} bondLength
   */
  addBond: function( a, b, order, bondLength ) {
    this.bonds.push( new Bond( a, b, order, bondLength ) );

    if ( a === this.centralAtom || b === this.centralAtom ) {
      this.centralAtomCount++;
    }
  },

  /**
   * Adds the central atom for the shape.
   * @public
   *
   * @param {RealAtomPosition} atom
   */
  addCentralAtom: function( atom ) {
    this.addAtom( atom );
    this.centralAtom = atom;
  },

  /**
   * Adds a radial atom and its bond.
   * @public
   *
   * @param {RealAtomPosition} atom
   * @param {number} bondOrder - 0 for lone pair
   */
  addRadialAtom: function( atom, bondOrder ) {
    if ( USE_SIMPLIFIED_BOND_LENGTH ) {
      // adjust the position's magnitude to the proper scale
      atom.position.normalize().multiplyScalar( this.bondLengthOverride );
    }
    this.addAtom( atom );
    this.addBond( atom, this.centralAtom, bondOrder, USE_SIMPLIFIED_BOND_LENGTH ? this.bondLengthOverride : atom.position.magnitude );
  },

  /**
   * Debugging string.
   * @private
   *
   * @returns {string}
   */
  toString: function() {
    return this.displayName;
  }
} );

const createMoleculeShape = function( name, length, callback ) {
  const shape = new RealMoleculeShape( name, length );
  callback( shape );
  return shape;
};

const B = Element.B;
const Be = Element.Be;
const Br = Element.Br;
const C = Element.C;
const Cl = Element.Cl;
const F = Element.F;
const H = Element.H;
const N = Element.N;
const O = Element.O;
const P = Element.P;
const S = Element.S;
const Xe = Element.Xe;

// @public {RealMoleculeShape}
RealMoleculeShape.BERYLLIUM_CHLORIDE = createMoleculeShape( 'BeCl2', 1.8, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( Be, new Vector3( 0, 0, 0 ) ) );
  shape.addRadialAtom( new RealAtomPosition( Cl, new Vector3( 1.8, 0, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( Cl, new Vector3( -1.8, 0, 0 ), 3 ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.BORON_TRIFLUORIDE = createMoleculeShape( 'BF3', 1.313, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( B, new Vector3( 0, 0, 0 ) ) );
  const angle = 2 * Math.PI / 3;
  const bondLength = 1.313;
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( bondLength * Math.cos( 0 * angle ), bondLength * Math.sin( 0 * angle ), 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( bondLength * Math.cos( 1 * angle ), bondLength * Math.sin( 1 * angle ), 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( bondLength * Math.cos( 2 * angle ), bondLength * Math.sin( 2 * angle ), 0 ), 3 ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.BROMINE_PENTAFLUORIDE = createMoleculeShape( 'BrF5', 1.774, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( Br, new Vector3( 0, 0, 0 ), 1 ) );
  const axialBondLength = 1.689;
  const radialBondLength = 1.774;
  const angle = DotUtils.toRadians( 84.8 );
  const radialDistance = Math.sin( angle ) * radialBondLength;
  const axialDistance = Math.cos( angle ) * radialBondLength;
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 0, -axialBondLength, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( radialDistance, -axialDistance, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 0, -axialDistance, radialDistance ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( -radialDistance, -axialDistance, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 0, -axialDistance, -radialDistance ), 3 ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.METHANE = createMoleculeShape( 'CH4', 1.087, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( C, new Vector3( 0, 0, 0 ) ) );
  const bondLength = 1.087;
  const vectors = GeometryConfiguration.getConfiguration( 4 ).unitVectors;
  for ( let i = 0; i < vectors.length; i++ ) {
    shape.addRadialAtom( new RealAtomPosition( H, vectors[ i ].times( bondLength ), 0 ), 1 );
  }
} );

// @public {RealMoleculeShape}
RealMoleculeShape.CHLORINE_TRIFLUORIDE = createMoleculeShape( 'ClF3', 1.698, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( Cl, new Vector3( 0, 0, 0 ), 2 ) );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 0, -1.598, 0 ), 3 ), 1 );
  const radialAngle = DotUtils.toRadians( 87.5 );
  const radialBondLength = 1.698;
  const radialDistance = Math.sin( radialAngle ) * radialBondLength;
  const axialDistance = Math.cos( radialAngle ) * radialBondLength;
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( radialDistance, -axialDistance, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( -radialDistance, -axialDistance, 0 ), 3 ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.CARBON_DIOXIDE = createMoleculeShape( 'CO2', 1.163, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( C, new Vector3( 0, 0, 0 ) ) );
  shape.addRadialAtom( new RealAtomPosition( O, new Vector3( -1.163, 0, 0 ), 2 ), 2 );
  shape.addRadialAtom( new RealAtomPosition( O, new Vector3( 1.163, 0, 0 ), 2 ), 2 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.WATER = createMoleculeShape( 'H2O', 0.957, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( O, new Vector3( 0, 0, 0 ), 2 ) );
  const radialBondLength = 0.957;
  const radialAngle = DotUtils.toRadians( 104.5 ) / 2;
  shape.addRadialAtom( new RealAtomPosition( H, new Vector3( Math.sin( radialAngle ), -Math.cos( radialAngle ), 0 ).times( radialBondLength ) ), 1 );
  shape.addRadialAtom( new RealAtomPosition( H, new Vector3( -( Math.sin( radialAngle ) ), -Math.cos( radialAngle ), 0 ).times( radialBondLength ) ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.AMMONIA = createMoleculeShape( 'NH3', 1.017, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( N, new Vector3( 0, 0, 0 ), 1 ) );
  const radialBondLength = 1.017;

  // to solve a 'axial' angle (from the axis of symmetry), Solve[Cos[\[Beta]] == Cos[\[Alpha]]^2*Cos[\[Theta]] + Sin[\[Alpha]]^2, \[Alpha]]  where beta is our given intra-bond angle, alpha is solved for, and theta = 2 pi / n where n is our number of bonds (3 in this case)
  const axialAngle = 1.202623030417028; // lots of precision, from Mathematica
  const radialAngle = 2 * Math.PI / 3;
  const radialDistance = Math.sin( axialAngle ) * radialBondLength;
  const axialDistance = Math.cos( axialAngle ) * radialBondLength;
  shape.addRadialAtom( new RealAtomPosition( H, new Vector3( radialDistance * Math.cos( 0 * radialAngle ), -axialDistance, radialDistance * Math.sin( 0 * radialAngle ) ) ), 1 );
  shape.addRadialAtom( new RealAtomPosition( H, new Vector3( radialDistance * Math.cos( 1 * radialAngle ), -axialDistance, radialDistance * Math.sin( 1 * radialAngle ) ) ), 1 );
  shape.addRadialAtom( new RealAtomPosition( H, new Vector3( radialDistance * Math.cos( 2 * radialAngle ), -axialDistance, radialDistance * Math.sin( 2 * radialAngle ) ) ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.PHOSPHORUS_PENTACHLORIDE = createMoleculeShape( 'PCl5', 2.02, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( P, new Vector3( 0, 0, 0 ) ) );
  shape.addRadialAtom( new RealAtomPosition( Cl, new Vector3( 2.14, 0, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( Cl, new Vector3( -2.14, 0, 0 ), 3 ), 1 );
  const radialAngle = 2 * Math.PI / 3;
  const radialBondLength = 2.02;
  shape.addRadialAtom( new RealAtomPosition( Cl, new Vector3( 0, Math.cos( 0 * radialAngle ), Math.sin( 0 * radialAngle ) ).times( radialBondLength ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( Cl, new Vector3( 0, Math.cos( 1 * radialAngle ), Math.sin( 1 * radialAngle ) ).times( radialBondLength ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( Cl, new Vector3( 0, Math.cos( 2 * radialAngle ), Math.sin( 2 * radialAngle ) ).times( radialBondLength ), 3 ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.SULFUR_TETRAFLUORIDE = createMoleculeShape( 'SF4', 1.595, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( S, new Vector3( 0, 0, 0 ), 1 ) );
  const largeAngle = DotUtils.toRadians( 173.1 ) / 2;
  const smallAngle = DotUtils.toRadians( 101.6 ) / 2;

  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( Math.sin( largeAngle ), -Math.cos( largeAngle ), 0 ).times( 1.646 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( -Math.sin( largeAngle ), -Math.cos( largeAngle ), 0 ).times( 1.646 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 0, -Math.cos( smallAngle ), Math.sin( smallAngle ) ).times( 1.545 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 0, -Math.cos( smallAngle ), -Math.sin( smallAngle ) ).times( 1.545 ), 3 ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.SULFUR_HEXAFLUORIDE = createMoleculeShape( 'SF6', 1.564, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( S, new Vector3( 0, 0, 0 ) ) );
  const vectors = GeometryConfiguration.getConfiguration( 6 ).unitVectors;
  for ( let i = 0; i < vectors.length; i++ ) {
    shape.addRadialAtom( new RealAtomPosition( F, vectors[ i ].times( 1.564 ), 3 ), 1 );
  }
} );

// @public {RealMoleculeShape}
RealMoleculeShape.SULFUR_DIOXIDE = createMoleculeShape( 'SO2', 1.431, function( shape ) {
  const bondAngle = DotUtils.toRadians( 119 ) / 2;
  const bondLength = 1.431;
  shape.addCentralAtom( new RealAtomPosition( S, new Vector3( 0, 0, 0 ), 1 ) );
  shape.addRadialAtom( new RealAtomPosition( O, new Vector3( Math.sin( bondAngle ), -Math.cos( bondAngle ), 0 ).times( bondLength ), 2 ), 2 );
  shape.addRadialAtom( new RealAtomPosition( O, new Vector3( -Math.sin( bondAngle ), -Math.cos( bondAngle ), 0 ).times( bondLength ), 2 ), 2 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.XENON_DIFLUORIDE = createMoleculeShape( 'XeF2', 1.977, function( shape ) {
  shape.addCentralAtom( new RealAtomPosition( Xe, new Vector3( 0, 0, 0 ), 3 ) );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 1.977, 0, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( -1.977, 0, 0 ), 3 ), 1 );
} );

// @public {RealMoleculeShape}
RealMoleculeShape.XENON_TETRAFLUORIDE = createMoleculeShape( 'XeF4', 1.953, function( shape ) {
  const bondLength = 1.953;
  shape.addCentralAtom( new RealAtomPosition( Xe, new Vector3( 0, 0, 0 ), 2 ) );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( bondLength, 0, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( -bondLength, 0, 0 ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 0, 0, bondLength ), 3 ), 1 );
  shape.addRadialAtom( new RealAtomPosition( F, new Vector3( 0, 0, -bondLength ), 3 ), 1 );
} );

// @public {Array.<RealMoleculeShape>} - Molecule shapes for the "Basic" version of the simulation
RealMoleculeShape.TAB_2_BASIC_MOLECULES = [
  RealMoleculeShape.BERYLLIUM_CHLORIDE,
  RealMoleculeShape.BORON_TRIFLUORIDE,
  RealMoleculeShape.METHANE,
  RealMoleculeShape.PHOSPHORUS_PENTACHLORIDE,
  RealMoleculeShape.SULFUR_HEXAFLUORIDE
];

// @public {Array.<RealMoleculeShape>} - Molecule shapes for the non-"Basic" version of the simulation
RealMoleculeShape.TAB_2_MOLECULES = [
  // CO2, H2O, SO2, XeF2, BF3, ClF3, NH3, CH4, SF4, XeF4, BrF5, PCl5, SF6
  RealMoleculeShape.WATER,
  RealMoleculeShape.CARBON_DIOXIDE,
  RealMoleculeShape.SULFUR_DIOXIDE,
  RealMoleculeShape.XENON_DIFLUORIDE,
  RealMoleculeShape.BORON_TRIFLUORIDE,
  RealMoleculeShape.CHLORINE_TRIFLUORIDE,
  RealMoleculeShape.AMMONIA,
  RealMoleculeShape.METHANE,
  RealMoleculeShape.SULFUR_TETRAFLUORIDE,
  RealMoleculeShape.XENON_TETRAFLUORIDE,
  RealMoleculeShape.BROMINE_PENTAFLUORIDE,
  RealMoleculeShape.PHOSPHORUS_PENTACHLORIDE,
  RealMoleculeShape.SULFUR_HEXAFLUORIDE
];

export default RealMoleculeShape;
