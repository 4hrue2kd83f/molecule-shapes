// Copyright 2014-2017, University of Colorado Boulder

/**
 * Model for the 'Real' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var AttractorModel = require( 'MOLECULE_SHAPES/common/model/AttractorModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LocalShape = require( 'MOLECULE_SHAPES/common/model/LocalShape' );
  var moleculeShapes = require( 'MOLECULE_SHAPES/moleculeShapes' );
  var MoleculeShapesModel = require( 'MOLECULE_SHAPES/common/model/MoleculeShapesModel' );
  var PairGroup = require( 'MOLECULE_SHAPES/common/model/PairGroup' );
  var Property = require( 'AXON/Property' );
  var RealMolecule = require( 'MOLECULE_SHAPES/common/model/RealMolecule' );
  var RealMoleculeShape = require( 'MOLECULE_SHAPES/common/model/RealMoleculeShape' );
  var Vector3 = require( 'DOT/Vector3' );
  var VSEPRConfiguration = require( 'MOLECULE_SHAPES/common/model/VSEPRConfiguration' );
  var VSEPRMolecule = require( 'MOLECULE_SHAPES/common/model/VSEPRMolecule' );

  /**
   * @constructor
   * @param {boolean} isBasicsVersion - Whether this is the Basics sim or not
   */
  function RealMoleculesModel( isBasicsVersion ) {
    var self = this;

    var startingMoleculeShape = isBasicsVersion ? RealMoleculeShape.TAB_2_BASIC_MOLECULES[ 0 ] : RealMoleculeShape.TAB_2_MOLECULES[ 0 ];
    var startingMolecule = new RealMolecule( startingMoleculeShape );

    MoleculeShapesModel.call( this, isBasicsVersion );
    this.moleculeProperty = new Property( startingMolecule ); // @override {Molecule}
    this.realMoleculeShapeProperty = new Property( startingMoleculeShape ); // {RealMoleculeShape}
    this.showRealViewProperty = new Property( true ); // whether the "Real" or "Model" view is shown


    this.showRealViewProperty.lazyLink( function() {
      self.rebuildMolecule( false );
    } );

    this.realMoleculeShapeProperty.lazyLink( function() {
      self.rebuildMolecule( true );
    } );
  }

  moleculeShapes.register( 'RealMoleculesModel', RealMoleculesModel );

  return inherit( MoleculeShapesModel, RealMoleculesModel, {
    /**
     * @public
     */
    reset: function() {
      MoleculeShapesModel.prototype.reset.call( this );
      this.moleculeProperty.reset();
      this.realMoleculeShapeProperty.reset();
      this.showRealViewProperty.reset();
      this.rebuildMolecule( true );
    },

    /*
     * Rebuilds our model molecule based on the possibly new "showRealView" or "realMoleculeShape".
     * @private
     *
     * @param {boolean} switchedRealMolecule - If false, we orient the new (model/real) view to the best match of the
     *                                         old (real/model) view. If true, the molecule type changed, so we don't
     *                                         do any matching of orientation.
     */
    rebuildMolecule: function( switchedRealMolecule ) {
      var molecule = this.moleculeProperty.get();

      var numRadialAtoms = this.realMoleculeShapeProperty.get().centralAtomCount;
      var numRadialLonePairs = this.realMoleculeShapeProperty.get().centralAtom.lonePairCount;
      var vseprConfiguration = VSEPRConfiguration.getConfiguration( numRadialAtoms, numRadialLonePairs );

      // get a copy of what might be the "old" molecule into whose space we need to rotate into
      var mappingMolecule;
      if ( switchedRealMolecule ) {
        // rebuild from scratch
        mappingMolecule = new RealMolecule( this.realMoleculeShapeProperty.get() );
      }
      else {
        // base the rotation on our original
        mappingMolecule = molecule;
      }

      var newMolecule;
      var mapping;
      if ( this.showRealViewProperty.get() ) {
        newMolecule = new RealMolecule( this.realMoleculeShapeProperty.get() );
        if ( !switchedRealMolecule ) {
          // NOTE: this might miss a couple improper mappings?

          // compute the mapping from our "ideal" to our "old" molecule
          var groups = new RealMolecule( this.realMoleculeShapeProperty.get() ).radialGroups;
          mapping = AttractorModel.findClosestMatchingConfiguration(
            AttractorModel.getOrientationsFromOrigin( mappingMolecule.radialGroups ),
            _.map( groups, function( pair ) {
              return pair.orientation;
            } ),
            LocalShape.vseprPermutations( mappingMolecule.radialGroups ) );
          _.each( newMolecule.groups, function( group ) {
            if ( group !== newMolecule.centralAtom ) {
              group.positionProperty.set( mapping.rotateVector( group.positionProperty.get() ) );
            }
          } );
        }

      }
      else {
        mapping = vseprConfiguration.getIdealGroupRotationToPositions( mappingMolecule.radialGroups );
        var permutation = mapping.permutation.inverted();
        var idealUnitVectors = vseprConfiguration.allOrientations;

        newMolecule = new VSEPRMolecule();

        var newCentralAtom = new PairGroup( new Vector3( 0, 0, 0 ), false );
        newMolecule.addCentralAtom( newCentralAtom );
        for ( var i = 0; i < numRadialAtoms + numRadialLonePairs; i++ ) {
          var unitVector = mapping.rotateVector( idealUnitVectors[ i ] );
          if ( i < numRadialLonePairs ) {
            newMolecule.addGroupAndBond( new PairGroup( unitVector.times( PairGroup.LONE_PAIR_DISTANCE ), true ), newCentralAtom, 0 );
          }
          else {
            // we need to dig the bond order out of the mapping molecule, and we need to pick the right one (thus the permutation being applied, at an offset)
            var oldRadialGroup = mappingMolecule.radialAtoms[ permutation.apply( i ) - numRadialLonePairs ];
            var bond = mappingMolecule.getParentBond( oldRadialGroup );
            var group = new PairGroup( unitVector.times( bond.length ), false );
            newMolecule.addGroupAndBond( group, newCentralAtom, bond.order, bond.length );

            newMolecule.addTerminalLonePairs( group, _.filter( mappingMolecule.getNeighbors( oldRadialGroup ), function( group ) { return group.isLonePair; } ).length );
          }
        }
      }

      this.moleculeProperty.set( newMolecule );
    }
  } );
} );

