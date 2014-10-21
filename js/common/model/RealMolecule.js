// Copyright 2002-2014, University of Colorado Boulder

/**
 * Represents a physically malleable version of a real molecule, with lone pairs if necessary.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var LocalShape = require( 'MOLECULE_SHAPES/common/model/LocalShape' );
  var Molecule = require( 'MOLECULE_SHAPES/common/model/Molecule' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var VseprConfiguration = require( 'MOLECULE_SHAPES/common/model/VseprConfiguration' );

  // TODO: rename parameter to RealMoleculeShape
  function RealMolecule( realMolecule ) {
    var i, group;

    Molecule.call( this );

    this.realMolecule = realMolecule;

    this.localShapeMap = {};

    var numLonePairs = realMolecule.centralAtom.lonePairCount;
    var numBonds = realMolecule.bonds.length;

    var idealCentralOrientations = [];
    var centralPairGroups = [];

    this.addCentralAtom( new PairGroup( new Vector3(), false, realMolecule.centralAtom.element ) );

    // add in bonds
    var bonds = realMolecule.bonds;
    for ( i = 0; i < bonds.length; i++ ) {
      var bond = bonds[i];
      var atom = bond.getOtherAtom( realMolecule.centralAtom );
      idealCentralOrientations.push( atom.orientation );
      var bondLength = atom.position.magnitude();

      var atomLocation = atom.orientation.times( bondLength );
      group = new PairGroup( atomLocation, false, atom.element );
      centralPairGroups.push( group );
      this.addGroupAndBond( group, this.centralAtom, bond.order, bondLength );

      this.addTerminalLonePairs( group, atom.lonePairCount );
    }

    // all of the ideal vectors (including for lone pairs)
    var vseprConfiguration = VseprConfiguration.getConfiguration( numBonds, numLonePairs );
    var idealModelVectors = vseprConfiguration.allOrientations;

    var mapping = vseprConfiguration.getIdealBondRotationToPositions( LocalShape.sortedLonePairsFirst( this.getNeighboringAtoms( this.centralAtom ) ) );

    // add in lone pairs in their correct "initial" positions
    for ( i = 0; i < numLonePairs; i++ ) {
      var orientation = mapping.rotateVector( idealModelVectors[i] );
      idealCentralOrientations.push( orientation );
      group = new PairGroup( orientation.times( PairGroup.LONE_PAIR_DISTANCE ), true );
      this.addGroupAndBond( group, this.centralAtom, 0, PairGroup.LONE_PAIR_DISTANCE );
      centralPairGroups.push( group );
    }

    this.localShapeMap[this.centralAtom.id] = new LocalShape( LocalShape.realPermutations( centralPairGroups ), this.centralAtom, centralPairGroups, idealCentralOrientations );

    // basically only use VSEPR model for the attraction on non-central atoms
    var radialAtoms = this.radialAtoms;
    for ( i = 0; i < radialAtoms.length; i++ ) {
      this.localShapeMap[radialAtoms[i].id] = this.getLocalVSEPRShape( radialAtoms[i] );
    }
  }

  return inherit( Molecule, RealMolecule, {
    update: function( tpf ) {
      Molecule.prototype.update.call( this, tpf );

      // angle-based repulsion
      var numAtoms = this.atoms.length;
      for ( var i = 0; i < numAtoms; i++ ) {
        var atom = this.atoms[i];
        var neighbors = this.getNeighbors( atom );
        if ( neighbors.length > 1 ) {
          var localShape = this.getLocalShape( atom );

          localShape.applyAngleAttractionRepulsion( tpf );
        }
      }
    },

    getLocalShape: function( atom ) {
      return this.localShapeMap[atom.id];
    },

    isReal: true,

    getMaximumBondLength: function() {
      return undefined;
    },

    getRealMolecule: function() {
      return this.realMolecule;
    }
  } );
} );
