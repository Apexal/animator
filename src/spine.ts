/** http://en.esotericsoftware.com/spine-json-format */

import { Pose } from "@tensorflow-models/pose-detection/dist/types";
import {
  BodyPartGroupID,
  bodyPartGroups,
  bodyPartGroupsToParent,
  pose_landmarks,
} from "./body";

type Bone = {
  name: string;
  x: number;
  y: number;
  rotation: number;
  length: number;
  parent?: string;
};

type LRBone = Pick<Bone, "x" | "y" | "length" | "rotation">;

type Coordinate = { x: number; y: number };


/** http://en.esotericsoftware.com/spine-json-format */
export function generateSpineJSON(width: number, height: number, pose: Pose) {
  const bones: Bone[] = [{ name: "root", length: 0, rotation: 0, x: 0, y: 0 }];
  const slots = [];
  const attachments = {};

  for (const bodyPartGroup in bodyPartGroups) {
    const bone = getBoneFromPose(
      bones.find(
        (b) => b.name === bodyPartGroupsToParent[bodyPartGroup as BodyPartGroupID]
      )!,
      pose,
      bodyPartGroup as BodyPartGroupID
    );

    bones.push({
      name: bodyPartGroup,
      parent: bodyPartGroupsToParent[bodyPartGroup as BodyPartGroupID],
      ...bone,
    });

    slots.push({
      name: bodyPartGroup,
      bone: bodyPartGroup,
      attachment: bodyPartGroup,
    });

    attachments[bodyPartGroup] = {
      [bodyPartGroup]: {
        x: 0,
        y: 0,
        rotation: 270,
        width,
        height,
      },
    };
  }

  return {
    skeleton: {
      hash: "QtXWOjjWRJI",
      spine: "4.1.19",
      images: "",
      audio: "",
    },
    bones,
    slots,
    skins: [
      {
        name: "default",
        attachments,
      },
    ],
    animations: {
      animation: {},
    },
  };
}

export function getBoneFromPose(
  parentBone: Bone,
  pose: Pose,
  bodyPartGroup: BodyPartGroupID
): LRBone {
  const posePos = (l: typeof pose_landmarks[number]): Coordinate => {
    const p = pose.keypoints[pose_landmarks.indexOf(l)];
    return {
      x: p.x - 1080 / 2,
      y: p.y,
    };
  };

  let from: Coordinate = {
    x: 0,
    y: 0,
  };
  let to: Coordinate = {
    x: 0,
    y: 0,
  };

  if (bodyPartGroup == "head") {
    const nose = posePos("nose");
    const leftShoulder = posePos("left_shoulder");
    const rightShoulder = posePos("right_shoulder");

    from = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2,
    };
    to = nose;
  } else if (bodyPartGroup == "torso") {
    const leftHip = posePos("left_hip");
    const rightHip = posePos("right_hip");

    const leftShoulder = posePos("left_shoulder");
    const rightShoulder = posePos("right_shoulder");
    from = between(leftHip, rightHip);
    to = between(leftShoulder, rightShoulder);
  } else if (bodyPartGroup === "left_upper_arm") {
    from = posePos("left_shoulder");
    to = posePos("left_elbow");
  }

  return baseBoneOnParent(
    {
      ...from,
      ...lengthAndRotation(from, to),
    },
    parentBone
  );
}

export function baseBoneOnParent(bone: LRBone, parentBone: LRBone): LRBone {
  // Global positions and rotations of the parent and target sprites
  const parentSpriteGlobalPosition = { x: parentBone.x, y: parentBone.y };
  const parentSpriteGlobalRotation = parentBone.rotation * (Math.PI / 180); // radians now

  const targetSpriteGlobalPosition = { x: bone.x, y: bone.y };
  const targetSpriteGlobalRotation = bone.rotation * (Math.PI / 180); // radians now

  // Step 1: Convert target sprite's global position to parent sprite's local space
  const localPosition = {
    x: targetSpriteGlobalPosition.x - parentSpriteGlobalPosition.x,
    y: targetSpriteGlobalPosition.y - parentSpriteGlobalPosition.y,
  };

  // Step 2: Convert target sprite's global rotation to parent sprite's local space
  const localRotation = targetSpriteGlobalRotation - parentSpriteGlobalRotation;

  // Step 3: Apply parent sprite's inverse transformation to get relative position and rotation
  const inverseTransform = [
    Math.cos(-parentSpriteGlobalRotation),
    Math.sin(-parentSpriteGlobalRotation),
    0,
    -Math.sin(-parentSpriteGlobalRotation),
    Math.cos(-parentSpriteGlobalRotation),
    0,
    -parentSpriteGlobalPosition.x,
    -parentSpriteGlobalPosition.y,
    1,
  ];
  const relativePosition = {
    x:
      localPosition.x * inverseTransform[0] +
      localPosition.y * inverseTransform[1] +
      inverseTransform[6],
    y:
      localPosition.x * inverseTransform[3] +
      localPosition.y * inverseTransform[4] +
      inverseTransform[7],
  };
  const relativeRotation = localRotation;

  return {
    // ...relativePosition,
    x: 0,
    y: 0,
    rotation: 0, //relativeRotation * (180 / Math.PI), // back to degrees
    length: bone.length,
  };
}

function lengthAndRotation(
  p1: Coordinate,
  p2: Coordinate
): { length: number; rotation: number } {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;

  const length = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));

  return {
    length,
    rotation: 0//Math.atan(dy / dx) * (180 / Math.PI),
  };
}

function between(p1: Coordinate, p2: Coordinate): Coordinate {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}
