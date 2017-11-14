/*
Copyright 2015, 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

import React from 'react';
import * as Roles from '../../../Roles';
import { _t } from '../../../languageHandler';

module.exports = React.createClass({
    displayName: 'PowerSelector',

    propTypes: {
        value: React.PropTypes.number.isRequired,
        // The maximum value that can be set with the power selector
        maxValue: React.PropTypes.number.isRequired,

        // Default user power level for the room
        usersDefault: React.PropTypes.number.isRequired,

        // if true, the <select/> should be a 'controlled' form element and updated by React
        // to reflect the current value, rather than left freeform.
        // MemberInfo uses controlled; RoomSettings uses non-controlled.
        //
        // ignored if disabled is truthy. false by default.
        controlled: React.PropTypes.bool,

        // should the user be able to change the value? false by default.
        disabled: React.PropTypes.bool,
        onChange: React.PropTypes.func,
    },

    getInitialState: function() {
        return {
            levelRoleMap: {},
            // List of power levels to show in the drop-down
            options: [],
        };
    },

    getDefaultProps: function() {
        return {
            maxValue: Infinity,
            usersDefault: 0,
        };
    },

    componentWillMount: function() {
        this._initStateFromProps(this.props, true);
    },

    componentWillReceiveProps: function(newProps) {
        this._initStateFromProps(newProps);
    },

    _initStateFromProps: function(newProps, initial) {
        // This needs to be done now because levelRoleMap has translated strings
        const levelRoleMap = Roles.levelRoleMap(newProps.usersDefault);
        const options = Object.keys(levelRoleMap).filter((l) => {
            return l === undefined || l <= newProps.maxValue;
        });

        this.setState({
            levelRoleMap,
            options,
        });

        if (initial) {
            this.setState({
                custom: levelRoleMap[newProps.value] === undefined,
            });
        }
    },

    onSelectChange: function(event) {
        this.setState({ custom: event.target.value === "SELECT_VALUE_CUSTOM" });
        if (event.target.value !== "SELECT_VALUE_CUSTOM") {
            this.props.onChange(this.getValue());
        }
    },

    onCustomBlur: function(event) {
        this.props.onChange(this.getValue());
    },

    onCustomKeyDown: function(event) {
        if (event.key == "Enter") {
            this.props.onChange(this.getValue());
        }
    },

    getValue: function() {
        if (this.refs.custom) {
            return parseInt(this.refs.custom.value);
        }
        if (this.refs.select) {
            return this.refs.select.value;
        }
        return undefined;
    },

    render: function() {
        let customPicker;
        if (this.state.custom) {
            let input;
            if (this.props.disabled) {
                input = <span>{ _t(
                    "Custom of %(powerLevel)s",
                    { powerLevel: this.props.value },
                ) }</span>;
            } else {
                input = <input
                    ref="custom"
                    type="text"
                    size="3"
                    defaultValue={this.props.value}
                    onBlur={this.onCustomBlur}
                    onKeyDown={this.onCustomKeyDown}
                />;
            }
            customPicker = <span> of { input }</span>;
        }

        let selectValue;
        if (this.state.custom) {
            selectValue = "SELECT_VALUE_CUSTOM";
        } else {
            selectValue = this.state.levelRoleMap[selectValue] ?
                this.props.value : "SELECT_VALUE_CUSTOM";
        }
        let select;
        if (this.props.disabled) {
            select = <span>{ this.state.levelRoleMap[selectValue] }</span>;
        } else {
            // Each level must have a definition in this.state.levelRoleMap
            let options = this.state.options.map((level) => {
                return {
                    value: level,
                    text: Roles.textualPowerLevel(level, this.props.usersDefault),
                };
            });
            options.push({ value: "SELECT_VALUE_CUSTOM", text: _t("Custom level") });
            options = options.map((op) => {
                return <option value={op.value} key={op.value}>{ op.text }</option>;
            });

            select =
                <select ref="select"
                        value={this.props.controlled ? selectValue : undefined}
                        defaultValue={!this.props.controlled ? selectValue : undefined}
                        onChange={this.onSelectChange}>
                    { options }
                </select>;
        }

        return (
            <span className="mx_PowerSelector">
                { select }
                { customPicker }
            </span>
        );
    },
});
