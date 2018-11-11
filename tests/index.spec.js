/* eslint-disable no-undef */
import React, { Component } from 'react';
import { mount, shallow, render } from 'enzyme';
import { renderToJson } from 'enzyme-to-json';
import Tabs, { TabPane } from '../src';
import TabContent from '../src/TabContent';
import ScrollableInkTabBar from '../src/ScrollableInkTabBar';
import InkTabBar from '../src/InkTabBar';

class NormoalTabs extends Component {
  getRoot() {
    return this.refs.root;
  }
  render() {
    return (
      <Tabs
        ref="root"
        defaultActiveKey="2"
        renderTabBar={() => <ScrollableInkTabBar/>}
        renderTabContent={() => <TabContent/>}
      >
        <TabPane tab="tab 1" key="1">first</TabPane>
        <TabPane tab="tab 2" key="2">second</TabPane>
        <TabPane tab="tab 3" key="3">third</TabPane>
      </Tabs>
    );
  }
}

describe('rc-tabs', () => {
  it('should render Tabs with correct DOM structure', () => {
    const wrapper = render(<NormoalTabs/>);
    expect(renderToJson(wrapper)).toMatchSnapshot();
  });

  it('create and nav should work', () => {
    const wrapper = mount(<NormoalTabs/>);
    expect(wrapper.find('.rc-tabs').length).toBe(1);
    expect(wrapper.find('.rc-tabs-tab').length).toBe(3);
  });

  it('default active should work', () => {
    const wrapper = mount(<NormoalTabs/>);
    expect(wrapper.find('.rc-tabs-tab').length).toBe(3);
    expect(wrapper.instance().getRoot().state.activeKey).toBe('2');
    expect(wrapper.find('.rc-tabs-tab').at(1).hasClass('rc-tabs-tab-active')).toBe(true);
  });

  it('onChange and onTabClick should work', () => {
    const handleChange = jest.fn();
    const handleTabClick = jest.fn();
    const wrapper = mount(
      <Tabs
        defaultActiveKey="1"
        renderTabBar={() => <ScrollableInkTabBar onTabClick={handleTabClick} />}
        renderTabContent={() => <TabContent/>}
        onChange={handleChange}
      >
        <TabPane tab="tab 1" key="1">first</TabPane>
        <TabPane tab="tab 2" key="2">second</TabPane>
        <TabPane tab="tab 3" key="3">third</TabPane>
      </Tabs>
    );
    const targetTab = wrapper.find('.rc-tabs-tab').at(2);
    targetTab.simulate('click');
    expect(handleTabClick).toHaveBeenCalledWith('3', expect.anything());
    expect(handleChange).toHaveBeenCalledWith('3');
  });

  it('should support custom next icon', () => {
    const handleChange = jest.fn();
    const handleTabClick = jest.fn();
    const renderTabBar = () => (
      <ScrollableInkTabBar
        onTabClick={handleTabClick}
        nextIcon={<span className="next-icon">next-icon</span>}
        prevIcon={<span className="prev-icon">prev-icon</span>}
      />
    );
    const wrapper = mount(
      <Tabs
        defaultActiveKey="1"
        renderTabBar={renderTabBar}
        renderTabContent={() => <TabContent/>}
        onChange={handleChange}
      >
        <TabPane tab="tab 1" key="1">first</TabPane>
        <TabPane tab="tab 2" key="2">second</TabPane>
        <TabPane tab="tab 3" key="3">third</TabPane>
      </Tabs>
    );
    const nextIcon = wrapper.find('.next-icon');
    const prevIcon = wrapper.find('.prev-icon');
    expect(nextIcon.length).toBe(1);
    expect(prevIcon.length).toBe(1);
    expect(nextIcon.at(0).text()).toBe('next-icon');
    expect(prevIcon.at(0).text()).toBe('prev-icon');
  });

  it('`onPrevClick` and `onNextClick` should work', () => {
    const onPrevClick = jest.fn();
    const onNextClick = jest.fn();
    const wrapper = mount(
      <Tabs
        defaultActiveKey="1"
        renderTabBar={() => (
          <ScrollableInkTabBar onPrevClick={onPrevClick} onNextClick={onNextClick} />
        )}
        renderTabContent={() => <TabContent/>}
      >
        <TabPane tab="tab 1" key="1">first</TabPane>
        <TabPane tab="tab 2" key="2">second</TabPane>
        <TabPane tab="tab 3" key="3">third</TabPane>
      </Tabs>
    );

    // To force Tabs show prev/next button
    Object.defineProperty(wrapper.find('.rc-tabs-nav').instance(), 'scrollWidth', {
      get() { return 1000; },
    });
    Object.defineProperty(wrapper.find('.rc-tabs-nav-wrap').instance(), 'scrollWidth', {
      get() { return 100; },
    });
    wrapper.update();

    setTimeout(() => {
      wrapper.find('.rc-tabs-tab-next').simulate('click');
      expect(onNextClick).toHaveBeenCalled();

      wrapper.find('.rc-tabs-tab-prev').simulate('click');
      expect(onPrevClick).toHaveBeenCalled();
    }, 10);
  });

  it('active first tab when children is changed', () => {
    const children = [1, 2, 3]
      .map(number => <TabPane tab={number} key={number.toString()}>{number}</TabPane>);
    const wrapper = shallow(
      <Tabs
        renderTabBar={() => <ScrollableInkTabBar />}
        renderTabContent={() => <TabContent/>}
      >
        {children}
      </Tabs>
    );
    expect(wrapper.state().activeKey).toBe('1');
    const newChildren = [...children];
    newChildren.shift();
    wrapper.setProps({
      children: newChildren,
    });
    expect(wrapper.state().activeKey).toBe('2');
  });

  it('active first tab when children is not changed at controlled mode', () => {
    const children = [1, 2, 3]
      .map(number => <TabPane tab={number} key={number.toString()}>{number}</TabPane>);
    const wrapper = shallow(
      <Tabs
        activeKey="1"
        renderTabBar={() => <ScrollableInkTabBar />}
        renderTabContent={() => <TabContent/>}
      >
        {children}
      </Tabs>
    );
    expect(wrapper.state().activeKey).toBe('1');
    const newChildren = [...children];
    newChildren.shift();
    wrapper.setProps({
      children: newChildren,
    });
    expect(wrapper.state().activeKey).toBe('1');
  });

  it('activate tab on click should show inkbar', () => {
    const children = [1, 2]
      .map(number => <TabPane tab={number} key={number.toString()}>{number}</TabPane>);
    const wrapper = mount(
      <Tabs
        renderTabBar={() => <InkTabBar />}
        renderTabContent={() => <TabContent/>}
      >
        {children}
      </Tabs>
    );

    wrapper.find('TabBarTabsNode').find('.rc-tabs-tab').at(1).simulate('click', {});
    expect(wrapper.find('InkTabBarNode').html().indexOf('display: block;') !== -1).toBe(true);
  });

  it('un-activate tab should not show inkbar', (done) => {
    const children = [1, 2]
      .map(number => <TabPane tab={number} key={number.toString()}>{number}</TabPane>);
    const wrapper = mount(
      <Tabs
        renderTabBar={() => <InkTabBar />}
        renderTabContent={() => <TabContent/>}
        activeKey="-1"
      >
        {children}
      </Tabs>
    );

    setTimeout(() => {
      expect(wrapper.find('InkTabBarNode').html().indexOf('display: none;') !== -1).toBe(true);
      done();
    }, 0);
  });

  it('tabBarGutter should work', () => {
    let wrapper = mount(
      <Tabs
        defaultActiveKey="3"
        tabBarPosition="top"
        renderTabBar={() => (
          <InkTabBar
            tabBarGutter={40}
          />
        )}
        renderTabContent={() => <TabContent />}
      >
        <TabPane tab="tab 1" key="1">first</TabPane>
        <TabPane tab="tab 2" key="2">second</TabPane>
      </Tabs>
    );

    expect(wrapper.find('.rc-tabs-tab').at(0).instance().style.marginRight).toBe('40px');

    wrapper = mount(
      <Tabs
        defaultActiveKey="3"
        tabBarPosition="left"
        renderTabBar={() => (
          <InkTabBar
            tabBarGutter={40}
          />
        )}
        renderTabContent={() => <TabContent />}
      >
        <TabPane tab="tab 1" key="1">first</TabPane>
        <TabPane tab="tab 2" key="2">second</TabPane>
      </Tabs>
    );

    expect(wrapper.find('.rc-tabs-tab').at(0).instance().style.marginTop).toBe('40px');
  });
});
