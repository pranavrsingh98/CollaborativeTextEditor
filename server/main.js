Meteor.startup(function () {
    // create a starter doc
    if (!Documents.findOne()){// no documents yet!
        Documents.insert({title:"my new document"});
    }
  });
  // publish a list of documents the user can se
  Meteor.publish("documents", function(){
    return Documents.find({
     $or:[
      {isPrivate:{$ne:true}},  //$ne means not equal to
      {owner:this.userId}
      ] 
    });
  })  
  // public sets of editing users
  Meteor.publish("editingUsers", function(){
    return EditingUsers.find();
  })

  Meteor.publish("comments",function(){
    return Comments.find();
  })


// we have moved all contents of if(Meteor.isServer) and also removed the if statement as this file is in server folder so we are definitly in server folder
