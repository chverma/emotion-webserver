/*
Copyright (c) 2013 Ann Huddleston
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 */

Ext.define('MyStuff.NotifyBar', {
	extend: 'Ext.toolbar.Toolbar',
	alias: 'widget.notifybar',
	requires: [
		'Ext.toolbar.*'
	],

	cls: 'notifybar',

	initComponent : function() {
		this.items = [
			{
				itemId: 'msg',
				flex: 1,
				xtype: 'tbtext',
				cls: 'notifybar-text',
				text: ''
			},
			{
				text: 'X',
				scope: this,
				handler: this.hideBar
			}
		];

		this.callParent(arguments);
		this.msgItem = this.child('#msg');
	},

	showSuccess : function(msg) {
		this.addClass('notifybar-success');
		this.showBar(msg);
	},

	showError : function(msg) {
		this.addClass('notifybar-error');
		this.showBar(msg);
	},

	showBar : function(msg) {
		this.msgItem.setText(msg);
		this.show();
		this.getEl().setOpacity(1, {
			duration: 1000
		});
	},

	hideBar : function () {
		if (this.rendered && !this.isHidden()) {
			Ext.suspendLayouts();
			this.hide();
			this.getEl().setOpacity(0.25, false);
			this.removeCls("notifybar-success notifybar-error");
			this.msgItem.update('');
			Ext.resumeLayouts(true);
		}
	},

    // Add custom processing to the beforeRender phase.
    beforeRender: function() {
        this.callParent(arguments);
	this.hide();
    },
    
    onDestroy: function() {
	this.getEl().stopAnimation();
	this.callParent(arguments);
    }
});
