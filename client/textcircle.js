  // subscriptions - allow read access to collections
  Meteor.subscribe("documents");
  Meteor.subscribe("editingUsers");
  Meteor.subscribe("comments");



  Router.configure({
    layoutTemplate:'ApplicationLayout'
  });

  Router.route('/',function(){
    console.log("you hit /");
    this.render('navbar',{to:"header"}); //written infront of yield
    this.render('docList',{to:"main"});
    // this.render('docItem',{to:"docItem"});
  });

  Router.route('/documents/:_id',function(){
    privateDocIndicator();
    console.log("you hit /documents "+this.params._id);
    Session.set("docid",this.params._id);
    this.render('navbar',{to:"header"}); //written infront of yield
    this.render('docItem',{to:"main"});
    // this.render('docItem',{to:"docItem"});
  });


  Template.editor.helpers({
    // return the id of the currently loaded doc
    docid:function(){
      setupCurrentDocument();
      return Session.get("docid");
    },
    // configure the CodeMirror editor
    config:function(){
      return function(editor){
        editor.setOption("lineNumbers", true);
        editor.setOption("theme", "cobalt");
          // respond to edits in the code editor window
        editor.on("change", function(cm_editor, info){
          $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
          Meteor.call("addEditingUser",Session.get("docid"));
        });
      }
    },
  });

  Template.editingUsers.helpers({
    // return users editing current document
    users:function(){
      var doc, eusers, users;
      doc = Documents.findOne({_id:Session.get("docid")});
      if (!doc){return;}// give up
      eusers = EditingUsers.findOne({docid:doc._id});
      if (!eusers){return;}// give up
      users = new Array();
      var i = 0;
      for (var user_id in eusers.users){
          users[i] = fixObjectKeys(eusers.users[user_id]);
          i++;
      }
      return users;
    }
  })

  Template.navbar.helpers({
    // return a list of all visible documents
    documents:function(){
      return Documents.find();
    },
  })

  Template.docMeta.helpers({
    // return current document
    document:function(){
      var doc = Documents.findOne({_id:Session.get("docid")});
      return doc;
    },
    // return true if I am allowed to edit the current doc, false otherwise
    canEdit:function(){
      var doc;
      doc = Documents.findOne({_id:Session.get("docid")});
      console.log("Selected Doc:" + doc.isPrivate);
      if (doc.owner == Meteor.userId()){
        return true;
      }
      return false;
    }
  });

  function privateDocIndicator() {
    var doc;
    doc = Documents.findOne({_id:Session.get("docid")});
    if (doc){
      ////////////////////////////////////////////////////  To Check the Private Checkbox
      if(document.getElementById("private")){
        if(doc.isPrivate==true){
          document.getElementById("private").checked = true;
          console.log("Private");
        }
        else {
          document.getElementById("private").checked = false;
          console.log("Public");
        }
      }
      ///////////////////////////////////////////////////
    }
  }

  Template.editableText.helpers({
    // return true if I am allowed to edit the current doc, false otherwise
    userCanEdit : function(doc,Collection) {
      // can edit if the current doc is owned by me.
      doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()});
      if (doc){
        return true;
      }
      else {
        return false;
      }
    }
  })

  Template.docList.helpers({
    // return a list of all visible documents
    listTitle:function(){
      if(Meteor.userId())
        return "Your Documents";
      else
        return "Please Login to View your Documents."
    },
    documents:function(){
      hideDropdown();
      return Documents.find();
    }
  })

  Template.insertCommentForm.helpers({
    docid:function(){
      return Session.get("docid");
    },
    owner:function(){
      return Meteor.userId();
    }
  })

  Template.commentList.helpers({
    comments:function(){
      return Comments.find({docid:Session.get("docid")});
    }
  });

  /////////
  /// EVENTS
  ////////

  Template.navbar.events({
    // add a new document button
    "click .js-add-doc":function(event){
      event.preventDefault();
      console.log("Add a new doc!");
      if (!Meteor.user()){// user not available
          alert("You need to login first!");
      }
      else {
        // they are logged in... lets insert a doc
        var id = Meteor.call("addDoc","passed", function(err, res){
          if (!err){// all good
            console.log("event callback received id: "+res);
            Session.set("docid", res);
          }
        });
      }
    },
    // load a document link
    "click .js-load-doc":function(event){
      //console.log(this);
      Session.set("docid", this._id);
      console.log("aAddDadADa");
    },

    "click #login-buttons-logout":function(){
      // alert("Logged out !!!!!");
      $(".navbar-brand").click();
    }
  });

  Template.docMeta.events({
    // toggle the private checkbox
    "click .js-tog-private":function(event){
      console.log(event.target.checked);
      if(event.target.checked)
        $('#checkbox').prop('checked', true);
      var doc = {_id:Session.get("docid"), isPrivate:event.target.checked};
      Meteor.call("updateDocPrivacy", doc);
    }
  });

  Template.docList.events({
    "click .glyphicon-trash":function(event){
      var doc;
      var title = Documents.findOne({_id:this._id}).title;
      //alert(title);
      //alert("event triggred "+title);
      //console.log(this._id);
      //cleandersonlobo:sweetalert2 was used
      swal({
        title: 'Are you sure?',
        text: "You will not be able to recover the file: "+title,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it'
        }).then((result) => {
          if (result.value) {
            swal(
              'Deleted!',
              'Your file "'+title+'" has been deleted.',
              'success'
            )
            Meteor.call("deleteDoc",this._id,function(err,res){
              if(!err){
                console.log("Doc Removed!!");
              }
            })
            // result.dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
          } else if (result.dismiss === 'cancel') {
            swal(
              'Cancelled',
              'Your file "'+title+'" is safe :)',
              'error'
            )
          }
        })
      }
  });


// we have moved all contents of if(Meteor.isClient) and also removed the if statement as this file is in client folder

// handy function that makes sure we have a document to work on
function setupCurrentDocument(){
  var doc;
  if (!Session.get("docid")){// no doc id set yet
    doc = Documents.findOne();
    if (doc){
      Session.set("docid", doc._id);
    }
  }
}
// function to change object keys by removing hyphens to make them
// compatible with space bars.
function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}


$(window).load(function() {     // becasue of this query dropdown funtion will be called on each window load
  hideDropdown();
});

function hideDropdown() {
    var usrSTS = Boolean(Meteor.userId());
    $(".dropdown-toggle")
    if(usrSTS == true){
      $(".dropdown-toggle").show();  //also enable the document dropdown
      //console.log("show fired");
    }
    else{
      // $(".button").hide();
      $(".dropdown-toggle").hide(); //also disable the document dropdown
      //console.log("hide fired");
    }
}
