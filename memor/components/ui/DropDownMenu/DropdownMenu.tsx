import React, { ReactNode, useRef, useState, useEffect } from "react";
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Modal,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
} from "react-native";

type DropdownMenuProps = {
  visible: boolean;
  handleClose: () => void;
  handleOpen: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
  dropdownWidth?: number;
  modalOverlayStyle?: StyleProp<ViewStyle>;
  menuStyle?: StyleProp<ViewStyle>;
  triggerContainerStyle?: StyleProp<ViewStyle>;
};

export const MenuTrigger = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export const MenuOption = ({
  onSelect,
  children,
  style,
}: {
  onSelect: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) => {
  return (
    <TouchableOpacity onPress={onSelect} style={[styles.menuOption, style]}>
      {children}
    </TouchableOpacity>
  );
};

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  visible,
  handleOpen,
  handleClose,
  trigger,
  children,
  dropdownWidth = 150,
  modalOverlayStyle,
  menuStyle,
  triggerContainerStyle,
}) => {
  const triggerRef = useRef<View>(null);
  const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });

  useEffect(() => {
    if (triggerRef.current && visible) {
      triggerRef.current.measure((fx, fy, width, height, px, py) => {
        setPosition({
          x: px,
          y: py + height,
          width: width,
        });
      });
    }
  }, [visible]);

  return (
    <View>
      <TouchableWithoutFeedback onPress={handleOpen}>
        <View ref={triggerRef} style={triggerContainerStyle}>
          {trigger}
        </View>
      </TouchableWithoutFeedback>
      {visible && (
        <Modal
          transparent={true}
          visible={visible}
          animationType="fade"
          onRequestClose={handleClose}
        >
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={[styles.modalOverlay, modalOverlayStyle]}>
              <View
                style={[
                  styles.menu,
                  {
                    top: position.y,
                    left: position.x + position.width / 2 + dropdownWidth / 12,
                    width: dropdownWidth,
                  },
                  menuStyle,
                ]}
              >
                {children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "transparent",
  },
  menu: {
    position: "absolute",
    width: 40,
    borderRadius: 5,
    padding: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  menuOption: {
    padding: 5,
  },
});
