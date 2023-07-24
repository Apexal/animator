import { Point } from "./canvas";

export const pose_landmarks = [
  "nose",
  "left_eye_inner",
  "left_eye",
  "left_eye_outer",
  "right_eye_inner",
  "right_eye",
  "right_eye_outer",
  "left_ear",
  "right_ear",
  "mouth_left",
  "mouth_right",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_pinky",
  "right_pinky",
  "left_index",
  "right_index",
  "left_thumb",
  "right_thumb",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
  "left_heel",
  "right_heel",
  "left_foot_index",
  "right_foot_index",
] as const;

export type BodyPartGroupID = keyof typeof bodyPartGroups;

export const bodyPartGroups = {
  torso: new Set([12, 13]),
  head: new Set([0, 1]),
  left_upper_arm: new Set([2, 3]),
  left_lower_arm: new Set([6, 7]),
  left_hand: new Set([10]),
  right_upper_arm: new Set([4, 5]),
  right_lower_arm: new Set([8, 9]),
  right_hand: new Set([11]),
  left_upper_leg: new Set([14, 15]),
  left_lower_leg: new Set([18, 19]),
  left_foot: new Set([22]),
  right_upper_leg: new Set([16, 17]),
  right_lower_leg: new Set([20, 21]),
  right_foot: new Set([23]),
} as const;

export const bodyPartGroupsByPartId: Record<number, BodyPartGroupID> =
  Object.entries(bodyPartGroups).reduce((obj, entry) => {
    for (const partId of entry[1].values()) {
      obj[partId] = entry[0] as BodyPartGroupID;
    }
    return obj;
  }, {} as Record<number, BodyPartGroupID>);

export const bodyPartGroupsToParent: Record<
  BodyPartGroupID,
  BodyPartGroupID | "root"
> = {
  head: "torso",
  torso: "root",
  left_upper_arm: "torso",
  left_lower_arm: "left_upper_arm",
  left_hand: "left_lower_arm",
  right_upper_arm: "torso",
  right_lower_arm: "right_upper_arm",
  right_hand: "right_lower_arm",
  left_upper_leg: "torso",
  left_lower_leg: "left_upper_leg",
  left_foot: "left_lower_leg",
  right_upper_leg: "torso",
  right_lower_leg: "right_upper_leg",
  right_foot: "right_lower_leg",
} as const;

export interface BodyPart {
  id: BodyPartGroupID;
  name: string;
  topLeft: Point;
  rawImageBase64: string;
}

export interface Character {
  name: string;
  body: Record<BodyPartGroupID, BodyPart>;
}