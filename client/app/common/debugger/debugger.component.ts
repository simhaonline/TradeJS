import {CookieService} from 'ngx-cookie';
declare var $: any;

import * as _ from 'lodash';
import {SocketService} from '../../services/socket.service';
import {Component, ElementRef, OnInit, OnDestroy} from '@angular/core';
import 'jquery-resizable-dom';

@Component({
	selector: 'debugger',
	templateUrl: './debugger.component.html',
	styleUrls: ['./debugger.component.scss']
})

export class DebuggerComponent implements OnInit, OnDestroy {

	private _maxResizeHeight: number = window.document.body.clientHeight - 100;

	public messages: Array<{
		type: string,
		text: string,
		data?: any
	}> = [];

	constructor(private socketService: SocketService,
				private _cookieService: CookieService,
				private elementRef: ElementRef) {
	}

	ngOnInit() {
		// Set window.resize handle
		this._restoreHeightFromCookie();
		this._setWindowResizeHandle();
		this._setDragger();

		this.socketService.socket.on('debug', data => {
			this.messages.push(data);
		});
	}

	private _restoreHeightFromCookie() {
		let storedHeight = this._cookieService.get('footer-resize-height');

		if (storedHeight) {
			this.elementRef.nativeElement.style.height = storedHeight;
		}
	}

	private _storeHeightInCookie() {
		this._cookieService.put('footer-resize-height', this.elementRef.nativeElement.style.height);
	}

	private _setWindowResizeHandle() {
		$(window).on('resize.debugger', _.debounce(this._onResizeEvent.bind(this), 250));
	}

	private _onResizeEvent() {
		this._maxResizeHeight = window.document.body.clientHeight - 100;

		if (this.elementRef.nativeElement.clientHeight > this._maxResizeHeight)
			this.elementRef.nativeElement.style.height = this._maxResizeHeight + 'px';
	}

	private _setDragger() {
		$(this.elementRef.nativeElement).resizable({
			handleSelector: '.splitter',
			resizeWidth: false,
			resizeHeightFrom: 'top',
			onDrag: (e, $el, newWidth, newHeight) => {
				e.preventDefault();

				let maxHeight = this._maxResizeHeight,
					minHeight = 18;

				if (newHeight > maxHeight)
					newHeight = maxHeight;
				else if (newHeight < minHeight)
					newHeight = minHeight;

				$el[0].style.height = newHeight + 'px';

				return false;
			},
			onDragEnd: () => this._storeHeightInCookie()
		});
	}

	ngOnDestroy() {
		$(window).off('resize.debugger');
	}
}