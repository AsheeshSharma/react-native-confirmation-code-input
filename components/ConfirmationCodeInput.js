import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, TextInput, StyleSheet, Dimensions, ViewPropTypes } from 'react-native';
import _ from 'lodash';

// if ViewPropTypes is not defined fall back to View.propType (to support RN < 0.44)
const viewPropTypes = ViewPropTypes || View.propTypes;

export default class ConfirmationCodeInput extends Component {
  static propTypes = {
    codeLength: PropTypes.number,
    compareWithCode: PropTypes.string,
    inputPosition: PropTypes.string,
    size: PropTypes.number,
    space: PropTypes.number,
    className: PropTypes.string,
    cellBorderWidth: PropTypes.number,
    activeColor: PropTypes.string,
    inactiveColor: PropTypes.string,
    ignoreCase: PropTypes.bool,
    autoFocus: PropTypes.bool,
    codeInputStyle: TextInput.propTypes.style,
    containerStyle: viewPropTypes.style,
    onFulfill: PropTypes.func,
    defaultValues: PropTypes.Array
  };

  static defaultProps = {
    codeLength: 5,
    inputPosition: 'center',
    autoFocus: true,
    size: 40,
    className: 'border-box',
    cellBorderWidth: 1,
    activeColor: 'rgba(255, 255, 255, 1)',
    inactiveColor: 'rgba(255, 255, 255, 0.2)',
    space: 8,
    compareWithCode: '',
    ignoreCase: false,
    defaultValues: []
  };

  constructor(props) {
    super(props);

    this.state = {
      codeArr: this.props.defaultValues ? this.props.defaultValues : new Array(this.props.codeLength).fill(''),
      currentIndex: 0,
      inactiveColor: this.props.inactiveColor
    };
    this.codeInputRefs = [];
  }

  componentDidMount() {
    const { compareWithCode, codeLength, inputPosition } = this.props;
    let shouldNotCallApi = true
    if (this.state.codeArr && this.state.codeArr.length === this.props.codeLength) {
      for (let i = 0; i < this.props.codeLength; i++) {
        if (this.state.codeArr[i] !== '') {
          shouldNotCallApi = false
        }
      }
    }
    if (!shouldNotCallApi) {
      this.props.onFulfill(this.state.codeArr)
    }
    if (compareWithCode && compareWithCode.length !== codeLength) {
      console.error("Invalid props: compareWith length is not equal to codeLength");
    }

    if (_.indexOf(['center', 'left', 'right', 'full-width'], inputPosition) === -1) {
      console.error('Invalid input position. Must be in: center, left, right, full');
    }
  }

  componentWillReceiveProps(nextProps) {
    let shouldNotCallApi = true
    if (_.difference(nextProps.defaultValues, this.props.defaultValues).length > 0) {
      this.state = {
        codeArr: nextProps.defaultValues ? nextProps.defaultValues : new Array(nextProps.codeLength).fill(''),
        currentIndex: 0,
        inactiveColor: nextProps.inactiveColor
      };
      if (this.state.codeArr && this.state.codeArr.length === nextProps.codeLength) {
        for (let i = 0; i < nextProps.codeLength; i++) {
          if (this.state.codeArr[i] !== '') {
            shouldNotCallApi = false
          }
        }
      }
      if (!shouldNotCallApi) {
        nextProps.onFulfill(this.state.codeArr)
      }
    }

    if(nextProps.inactiveColor !== this.props.inactiveColor) {
      this.setState({inactiveColor : nextProps.inactiveColor})
    }
  }

  clear() {
    this.setState({
      codeArr: new Array(this.props.codeLength).fill(''),
      currentIndex: 0
    });
    this._setFocus(0);
  }

  _setFocus(index) {
    this.codeInputRefs[index].focus();
  }

  _blur(index) {
    this.codeInputRefs[index].blur();
  }

  _onFocus(index) {
    console.warn('Called')
    let newCodeArr = _.clone(this.state.codeArr);
    const currentEmptyIndex = _.findIndex(newCodeArr, c => !c);
    // console.warn(currentEmptyIndex)
    // if (currentEmptyIndex !== -1 && currentEmptyIndex < index) {
    //   return this._setFocus(currentEmptyIndex);
    // }
    for (const i in newCodeArr) {
      if (i >= index) {
        // newCodeArr[i] = '';
      }
    }

    this.setState({
      codeArr: newCodeArr,
      currentIndex: index
    })
  }

  _isMatchingCode(code, compareWithCode, ignoreCase = false) {
    if (ignoreCase) {
      return code.toLowerCase() == compareWithCode.toLowerCase();
    }
    return code == compareWithCode;
  }

  _getContainerStyle(size, position) {
    switch (position) {
      case 'left':
        return {
          justifyContent: 'flex-start',
          height: size
        };
      case 'center':
        return {
          justifyContent: 'center',
          height: size
        };
      case 'right':
        return {
          justifyContent: 'flex-end',
          height: size
        };
      default:
        return {
          justifyContent: 'space-between',
          height: size
        }
    }
  }

  _getInputSpaceStyle(space) {
    const { inputPosition } = this.props;
    switch (inputPosition) {
      case 'left':
        return {
          marginRight: space
        };
      case 'center':
        return {
          marginRight: space / 2,
          marginLeft: space / 2
        };
      case 'right':
        return {
          marginLeft: space
        };
      default:
        return {
          marginRight: 0,
          marginLeft: 0
        };
    }
  }

  _getClassStyle(className, active) {
    const { cellBorderWidth, activeColor, inactiveColor, space } = this.props;
    let classStyle = {
      ...this._getInputSpaceStyle(space),
      color: activeColor
    };
    switch (className) {
      case 'clear':
        return _.merge(classStyle, { borderWidth: 0 });
      case 'border-box':
        return _.merge(classStyle, {
          borderWidth: cellBorderWidth,
          borderColor: (active ? activeColor : inactiveColor)
        });
      case 'border-circle':
        return _.merge(classStyle, {
          borderWidth: cellBorderWidth,
          borderRadius: 50,
          borderColor: (active ? activeColor : inactiveColor)
        });
      case 'border-b':
        return _.merge(classStyle, {
          borderBottomWidth: cellBorderWidth,
          borderColor: (active ? activeColor : inactiveColor),
        });
      case 'border-b-t':
        return _.merge(classStyle, {
          borderTopWidth: cellBorderWidth,
          borderBottomWidth: cellBorderWidth,
          borderColor: (active ? activeColor : inactiveColor)
        });
      case 'border-l-r':
        return _.merge(classStyle, {
          borderLeftWidth: cellBorderWidth,
          borderRightWidth: cellBorderWidth,
          borderColor: (active ? activeColor : inactiveColor)
        });
      default:
        return className;
    }
  }

  _onKeyPress(e) {
    if (e.nativeEvent.key === 'Backspace') {
      const { currentIndex } = this.state;
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
      if(this.state.codeArr[currentIndex] === ''){
        this._setFocus(nextIndex);
      }
    }
  }

  _onInputCode(character, index) {
    const { codeLength, onFulfill, compareWithCode, ignoreCase } = this.props;
    let newCodeArr = _.clone(this.state.codeArr);
    newCodeArr[index] = character;
    if (index == codeLength - 1) {
      const code = newCodeArr.join('');

      if (compareWithCode) {
        const isMatching = this._isMatchingCode(code, compareWithCode, ignoreCase);
        onFulfill(isMatching, code);
        !isMatching && this.clear();
      } else {
        onFulfill(code);
      }
      this._blur(this.state.currentIndex);
    } else {
      if (character !== "") {
        this._setFocus(this.state.currentIndex + 1);
      } else {
        // this._setFocus(index);
      }
    }
    if (character !== '') {
      this.setState(prevState => {
        return {
          codeArr: newCodeArr,
          currentIndex: prevState.currentIndex + 1
        };
      });
    } else {
      this.setState(prevState => {
        return {
          codeArr: newCodeArr
        };
      });
    }
  }

  render() {
    const {
      codeLength,
      codeInputStyle,
      containerStyle,
      inputPosition,
      autoFocus,
      className,
      size,
      activeColor
    } = this.props;

    const initialCodeInputStyle = {
      width: size,
      height: size
    };
    let codeInputs = [];
    for (let i = 0; i < codeLength; i++) {
      const id = i;
      codeInputs.push(
        <TextInput
          key={id}
          ref={ref => (this.codeInputRefs[id] = ref)}
          style={[
            styles.codeInput,
            initialCodeInputStyle,
            this._getClassStyle(className, true && this.state.inactiveColor !== '#FE5858'),
            codeInputStyle
          ]}
          underlineColorAndroid="transparent"
          selectionColor={activeColor}
          keyboardType={'name-phone-pad'}
          returnKeyType={'done'}
          {...this.props}
          autoFocus={autoFocus && id == 0}
          onFocus={() => this._onFocus(id)}
          value={this.state.codeArr[id] || this.state.codeArr[id].toString() === '0' ? this.state.codeArr[id].toString() : ''}
          onChangeText={text => this._onInputCode(text, id)}
          onKeyPress={(e) => this._onKeyPress(e)}
          maxLength={1}
        />
      )
    }

    return (
      <View style={[styles.container, this._getContainerStyle(size, inputPosition), containerStyle]}>
        {codeInputs}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20
  },
  codeInput: {
    backgroundColor: 'transparent',
    textAlign: 'center',
    padding: 0
  }
});