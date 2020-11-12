/*
 * Copyright (C) 2007-2020 Crafter Software Corporation. All Rights Reserved.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as published by
 * the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import { DetailedItem } from '../../../models/Item';

export function isNavigable(item: DetailedItem): boolean {
  return item.systemType === 'page';
}

export function isPreviewable(item: DetailedItem): boolean {
  return (
    item.systemType === 'component' ||
    item.systemType === 'asset' ||
    item.systemType === 'template' ||
    item.systemType === 'script' ||
    item.systemType === 'taxonomy'
  );
}

export function isFolder(item: DetailedItem): boolean {
  return item.systemType === 'folder';
}

export function getNumOfMenuOptionsForItem(item: DetailedItem): number {
  if (isNavigable(item)) {
    return 13;
  } else if (isFolder(item)) {
    return 6;
  } else if (isPreviewable(item)) {
    return 11;
  }
}
export function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
