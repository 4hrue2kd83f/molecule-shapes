//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Model for the 'Model' screen.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector3 = require( 'DOT/Vector3' );
  var MoleculeShapesModel = require( 'MOLECULE_SHAPES/model/MoleculeShapesModel' );
  var VSEPRMolecule = require( 'MOLECULE_SHAPES/model/VSEPRMolecule' );
  var PairGroup = require( 'MOLECULE_SHAPES/model/PairGroup' );

  /**
   * @constructor
   */
  function ModelMoleculesModel( isBasicsVersion ) {
    var model = this;

    var initialMolecule = new VSEPRMolecule();

    // inherits PropertySet, these are made into properties
    MoleculeShapesModel.call( this, isBasicsVersion, {
      molecule: initialMolecule,
      addSingleBondEnabled: true,
      addDoubleBondEnabled: true,
      addTripleBondEnabled: true,
      addLonePairEnabled: true
    } );

    this.molecule.addCentralAtom( new PairGroup( new Vector3(), false ) );
    this.setupInitialMoleculeState();

    // when the molecule is made empty, make sure to show lone pairs again (will allow us to drag out new ones)
    this.molecule.on( 'bondChanged', function() {
      if ( model.molecule.radialLonePairs.length === 0 ) {
        model.showLonePairs = true;
      }
    } );
  }

  return inherit( MoleculeShapesModel, ModelMoleculesModel, {
    setupInitialMoleculeState: function() {
      // start with two single bonds
      var centralAtom = this.molecule.centralAtom;
      this.molecule.addGroupAndBond( new PairGroup( new Vector3( 8, 0, 3 ).normalized().times( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
      var v = new Vector3( 2, 8, -5 );
      this.molecule.addGroupAndBond( new PairGroup( v.normalized().times( PairGroup.BONDED_PAIR_DISTANCE ), false ), centralAtom, 1 );
    },

    reset: function() {
      MoleculeShapesModel.prototype.reset.call( this );

      this.molecule.removeAllGroups();
      this.setupInitialMoleculeState();
    },

    step: function( dt ) {
      MoleculeShapesModel.prototype.step.call( this, dt );
    }
  } );
} );
