var pageSession = new ReactiveDict();

Template.HomePrivateDonorsEdit.rendered = function() {
	
};

Template.HomePrivateDonorsEdit.events({
	
});

Template.HomePrivateDonorsEdit.helpers({
	
});

Template.HomePrivateDonorsEditEditForm.rendered = function() {
	
	var my_latlng = Session.get("mylatlng");
	if(my_latlng) {
		$("input[name='lat']").val(my_latlng.lat);
		$("input[name='lng']").val(my_latlng.lng);
	}
		

	pageSession.set("homePrivateDonorsEditEditFormInfoMessage", "");
	pageSession.set("homePrivateDonorsEditEditFormErrorMessage", "");

	$(".input-group.date").each(function() {
		var format = $(this).find("input[type='text']").attr("data-format");

		if(format) {
			format = format.toLowerCase();
		}
		else {
			format = "mm/dd/yyyy";
		}

		$(this).datepicker({
			autoclose: true,
			todayHighlight: true,
			todayBtn: true,
			forceParse: false,
			keyboardNavigation: false,
			format: format
		});
	});

	$("input[type='file']").fileinput();
	$("select[data-role='tagsinput']").tagsinput();
	$(".bootstrap-tagsinput").addClass("form-control");
	$("input[autofocus]").focus();
};

Template.HomePrivateDonorsEditEditForm.events({
	"submit": function(e, t) {
		e.preventDefault();
		pageSession.set("homePrivateDonorsEditEditFormInfoMessage", "");
		pageSession.set("homePrivateDonorsEditEditFormErrorMessage", "");

		var self = this;

		function submitAction(msg) {
			var homePrivateDonorsEditEditFormMode = "update";
			if(!t.find("#form-cancel-button")) {
				switch(homePrivateDonorsEditEditFormMode) {
					case "insert": {
						$(e.target)[0].reset();
					}; break;

					case "update": {
						var message = msg || "Saved.";
						pageSession.set("homePrivateDonorsEditEditFormInfoMessage", message);
					}; break;
				}
			}

			Router.go("home_private.donors", {});
		}

		function errorAction(msg) {
			msg = msg || "";
			var message = msg.message || msg || "Error.";
			pageSession.set("homePrivateDonorsEditEditFormErrorMessage", message);
		}

		validateForm(
			$(e.target),
			function(fieldName, fieldValue) {

			},
			function(msg) {

			},
			function(values) {
				

				Donors.update({ _id: t.data.donor._id }, { $set: values }, function(e) { if(e) errorAction(e); else submitAction(); });
			}
		);

		return false;
	},
	"click #form-cancel-button": function(e, t) {
		e.preventDefault();

		

		Router.go("home_private.donors", {});
	},
	"click #form-close-button": function(e, t) {
		e.preventDefault();

		Router.go("home_private.donors", {});
	},
	"click #form-back-button": function(e, t) {
		e.preventDefault();

		Router.go("home_private.donors", {});
	}

	
});

Template.HomePrivateDonorsEditEditForm.helpers({
	"infoMessage": function() {
		return pageSession.get("homePrivateDonorsEditEditFormInfoMessage");
	},
	"errorMessage": function() {
		return pageSession.get("homePrivateDonorsEditEditFormErrorMessage");
	}
	
});
